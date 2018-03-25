
"use strict"


import { rules } from "./grammar.js"



const error = { ERROR: true }            // Used as a Symbol, could be expanded with error details.

let tokens
let tokenAt = 0




// Notation (root) rules keep references to reachable terminals and reachable `fixed` rules, whose token value or 
// parsed branch doesn't change within a single parsing attempt.

function serialise( rule, root = null ){

   if( root === null ){

      const root = {}
      root.immutables = []
      root.terminals = new Set()

      rule = serialise(rule, root)
      rule.immutables = root.immutables
      rule.terminals = [...root.terminals]

      return rule
   }


   // Optional branch.
   if( rule === null ){
      return rule
   }

   // Strings refer to named rules.
   if( typeof rule === "string" ){
      if( !rules[rule] )
         throw new Error("Impossible.")
      return serialise(rules[rule], root)
   }

   // An array represents a sequence of symbols.
   if( Array.isArray(rule) ){
      return { symbols: rule.map(symbol => serialise(symbol, root)) }
   }

   // Immutable value/branch.
   if( rule.fixed ){
      root.immutables.push(rule)
   }

   // Terminal token.
   if( rule.tokenType ){
      root.terminals.add(rule)
      return rule
   }

   // Has to be an instruction object.
   if( typeof rule !== "object" ){
      throw new Error("Impossible.")
   }



   if( rule.symbol ){
      rule.symbol = serialise(rule.symbol, root)
   }
   else if( rule.symbols ){
      rule.symbols = rule.symbols.map(symbol => serialise(symbol, root))
   }
   else if( rule.repeat ){
      rule.repeat = rule.repeat.map(symbol => serialise(symbol, root))
   }
   else if( rule.either ){
      rule.either = rule.either.map(symbol => serialise(symbol, root))
   }
   else if( rule.allow ){
      rule.either = [serialise(rule.allow, root), null]
      delete rule.allow
   }
   else {
      throw new Error("Impossible.")
   }

   return rule

}


// Parse a string to tokens based on a rule.

function tokenise( terminals, string ){
   
  // const terminals = rule.terminals
  const regex = new RegExp(terminals.sort((a, b) => a.index - b.index).map(({ regex }) => `(${regex})`).join("|"), "y")

  // const regex = new RegExp(tokenTypes.map(({ regex }) => `(${regex})`).join("|"), "y")
   const tokens = []
   while( regex.lastIndex < string.length ){
      const matches = regex.exec(string)
      if( matches === null )
         throw new Error("nece ici care")
      const index = matches.findIndex((type, i) => i && type)
      tokens.push({ type: terminals[index - 1].tokenType, value: matches[index] })
   }
   return tokens

}


// Extract terminal (token) rules relevant for a rule.

function markTerminals( rule ){

   if( rule === null ){
      return
   }

   if( rule.tokenType ){
      rules[rule.tokenType].marked = true
      return
   }

   if( rule.symbol ){
      markTerminals(rule.symbol)
      return
   }

   const children = rule.symbols || rule.either || rule.repeat
   if( !children )
      return
   for( const symbol of children )
      markTerminals(symbol)

}

function parseRule( rule ){

   let result

   // Used for optional rules.
   if( rule === null ){
      return null
   }

   // Terminal symbol.
   if( rule.tokenType ){
      const token = tokens[tokenAt]
      if( !token || token.type !== rule.tokenType )
         return error

      if( rule.fixed ){
         if( !rule.value )
            rule.value = token.value
         else if( token.value !== rule.value )
            return error
      }

      result = token.value
      tokenAt++
   }

   // List of symbols.
   else if( rule.symbol ){
      result = parseRule(rule.symbol)
      if( result === error )
         return error
   }

   // List of symbols.
   else if( rule.symbols ){
      result = []
      for( const symbol of rule.symbols ){
         const parsed = parseRule(symbol)
         if( parsed === error )
            return error
         result.push(parsed)
      }
   }

   // List of symbols to repeat.
   else if( rule.repeat ){
      result = []
      while( result.length < rule.max ){
         const at = tokenAt
         const parsed = parseRule({ symbols: rule.repeat })
         if( parsed === error ){
            tokenAt = at
            break
         }
         result.push(parsed)
      }

      if( result.length < rule.min || result.length > rule.max ){
         return error
      }
   }

   // List of possible parsing branches; return the first that parses successfully.
   else if( rule.either ){

      for( const branch of rule.either ){
         const at = tokenAt
         const parsed = parseRule(branch)
         if( parsed === error ){
            tokenAt = at
            continue
         }

         const processor = rule.processor

         if( rule.fixed ){
            if( rule.value === undefined )
               rule.value = branch
            else if( branch !== rule.value )
               return error
         }

         return processor ? processor(parsed) : parsed
      }

      return error
   }

   return rule.processor ? rule.processor(result) : result

}


// Returns the throws array or null on fails.

function parse( notation, string ){

   // This one's not meant to be caught, or happen.
   if( !notation || !rules[notation] )
      throw new Error("Unknown notation.")


   // Not initialised yet.
   if( typeof rules[notation] === "function" ){
      rules[notation] = serialise(rules[notation]())
   }

   const rule = rules[notation]

   // Clear the state of previous run.
   for( const symbol of rule.immutables )
      delete symbol.value


   tokenAt = 0

   tokens = tokenise(rule.terminals, string)

   if( !tokens.length )
      return null

   const result = parseRule(rule)
   if( result === error || tokenAt !== tokens.length )
      return null

   return result

}


export { parse }