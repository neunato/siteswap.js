
import { Toss } from "./Toss";


// If there is anything that needs refactoring, it's this file. The entire 
// legacy parser bit sucks. I should rebuild it along with a passing notation 
// parser, possibly multihand too.

// The generic notation itself, or its legacy extension, has some issues:
// - (5) is treated as an invalid sync pattern
// - [15][1] is treated as [1,5],1 instead of 15,1


class Token {
   
   constructor( type, value = null ){
      this.type = type;
      this.value = value;
   }

}

class Tokeniser {

   tokenise( string, patterns ){

      const tokens = [];
      const keys = Object.keys(patterns);

      let substring = string;
      while( substring.length ){

         if( !keys.some( (key) => {

            const match = substring.match(patterns[key]);
            if( match ){
               const value = match[0];
               tokens.push( new Token(key, value) );
               substring = substring.slice(value.length);
               return true;
            }

            return false;

         }) ){
            throw new Error("Unsupported character.");
         }

      }

      tokens.push( new Token("end") );

      return tokens;

   }

}

class GenericTokeniser extends Tokeniser {

   constructor(){

      super();

      this.tokenTypes = {
         "[":     /^\[/,
         "]":     /^\]/,
         "(":     /^\(/,
         ")":     /^\)/,
         ",":     /^,/,
         " ":     /^ /,
         "value": /^(?:(?:[1-9][0-9]+)|[0-9])/,
         "hand":  /^[a-zA-Z]+/
      };

   }

   tokenise( string ){

      return super.tokenise(string, this.tokenTypes);

   }

}

// After parsing, this one modifies tokens to match the generic parser rules.
// While doing that, it also checks for some errors (like odd sync throw values,
// mixing of letters and double digit numbers, and invalid sync mirror structure).

class LegacyTokeniser extends Tokeniser {

   constructor(){

      super();

      this.tokenTypes = {
         "legacy": {
            "[":     /^\[/,
            "]":     /^\]/,
            "(":     /^\(/,
            ")":     /^\)/,
            ",":     /^,/,
            " ":     /^ /,
            "cross": /^x/,
            "value": /^(?:(?:[1-9][0-9]+)|[0-9]|[a-zA-Z])/,
            "mirror": /^\*/
         },

         "legacyCompressed": {
            "[":     /^\[/,
            "]":     /^\]/,
            "(":     /^\(/,
            ")":     /^\)/,
            ",":     /^,/,       // Only possible between actions.
            " ":     /^ /,       // Only possible between actions.
            "cross": /^x/,
            "value": /^(?:[0-9]|[a-zA-Z])/,
            "mirror": /^\*/
         }
      };

   }

   numerify( tokens ){

      const alpha = /^[a-z]$/i;
      const numeric = /^[1-9][0-9]+$/;

      const letters = tokens.some(token => alpha.test(token.value));
      const digits = tokens.some(token => numeric.test(token.value));
      if( letters && digits ){
         throw new Error("Inconsistent use of letters and double digit throw values.");
      }

      if( letters ){
         const offset = {
            "a": -("a".charCodeAt(0)) + 10,
            "A": -("A".charCodeAt(0)) + 36
         };
         for( const token of tokens ){
            if( /[a-z]/.test(token.value) )
              token.value = token.value.charCodeAt(0) + offset["a"];
            else if( /[A-Z]/.test(token.value) )
              token.value = token.value.charCodeAt(0) + offset["A"];
         }
      }

   }

   separate( tokens ){

      const refined = [];
      for( let i = 0; i < tokens.length - 1; i++ ){
         refined.push( tokens[i] );
         if( (tokens[i].type === "value" || tokens[i].type === "hand") && tokens[i + 1].type === "value" )
            refined.push( new Token(",", ",") );
      }
      refined.push(tokens[tokens.length - 1]);
      return refined;

   }

   halve( tokens ){

      for( const token of tokens ){
         const value = parseInt(token.value);
         if( value % 2 === 1 )
            throw new Error("Legacy sync mode allows only odd throw values.");
         token.value = value / 2;
      }

   }

   handify( tokens, hands ){

      const refined = [];

      for( let i = 0; i < tokens.length; i++ ){

         if( tokens[i].type === "("  &&  i + 1 < tokens.length  &&  tokens[i + 1].type === "value" ){

            refined.push( tokens[i++] );   // (
            refined.push( tokens[i++] );   // value
            let hand;
            if( tokens[i].type === "cross" ){
               hand = hands[1];
            }
            else{
               hand = hands[0];
               i--;
            }
            refined.push( new Token("hand", hand) );
            continue;
         }


         if( tokens[i].type === "value"  &&  ((i + 1 < tokens.length && tokens[i + 1].type === ")") || (i + 2 < tokens.length && tokens[i + 2].type === ")")) ){

            refined.push( tokens[i++] );   // value
            let hand;
            if( tokens[i].type === "cross" ){
               hand = hands[0];
            }
            else{
               hand = hands[1];
               i--;
            }
            refined.push( new Token("hand", hand) );
            refined.push( tokens[++i] );
            continue;
         }

         refined.push( tokens[i] );

      }

      return refined;

   }

   tokenise( string, hands ){

      const sync = string.includes("(");
      const compressed = (sync  ?  /\([^)]*[, ].*\)/  :  /[, ]/).test(string);
      const types = this.tokenTypes[compressed ? "legacy" : "legacyCompressed"];

      let tokens = super.tokenise(string, types);
      const values = tokens.filter( token => token.type === "value" );

      // Convert letters to numbers.
      this.numerify(values);

      // Insert separators if compressed.
      if( compressed )
         tokens = this.separate(tokens);

      // Halve synchronous throw values.
      if( sync )
         this.halve(values);

      // Specify hands.
      tokens = this.handify(tokens, hands);

      return tokens;

   }

}



class Parser {

   constructor(){

      this.state = null;
      this.tokens = null;
      this.legacyTokeniser = new LegacyTokeniser();
      this.genericTokeniser = new GenericTokeniser();

   }

   // Check if the upcoming token(s) are of a given type, without advancing.
   upcoming( types ){

      if( typeof types === "string" )
         return this.tokens[this.tokens.length - 1].type === types;

      return types.some( type => this.tokens[this.tokens.length - 1].type === type );

   }

   // Return the next token's value if it of a given type, or throw if not.
   expect( type, message = "Unexpected token." ){
   
      if( !this.upcoming(type) )
         throw new Error(message);
      return this.tokens.pop().value;

   }


   set( name, value, message ){

      if( this.state[name] === undefined )
         this.state[name] = value;

      else if( this.state[name] !== value )
         throw new Error(message);

   }

   autoset( name, tokenTypes, message ){

      for( const type of tokenTypes ){
         if( this.upcoming(type) ){
            this.set(name, type, message);
            return type;
         }
      }
      this.set(name, null, 'Expecting "' + this.state[name] + '", got "' + this.tokens[this.tokens.length - 1].type + '".');
      return null;

   }

   /////////////////////////////////////////////////////////////////

   parse( string, hands, legacy ){

      this.state = {};
      
      // Get rid of all the insignifant spaces leaving only separator spaces behind.
      const siteswap = string.trim().replace(/  +/g, " ").replace(/ ?([[,]|[\],]) ?/g, "$1");
      if( siteswap === "" )
         throw new Error("No siteswap supplied.");

      const tokeniser = legacy ? this.legacyTokeniser : this.genericTokeniser;
      this.tokens = tokeniser.tokenise(siteswap, hands).reverse();

      return this.siteswap(hands);

   }

   siteswap( hands ){

      const actions = [ this.action(hands) ];

      const separators = [",", " "];
      const separated = this.upcoming(separators);

      while( !this.upcoming("end") ){
         if( separated ){
            const separator = this.autoset("actionSeparator", separators, "Inconsistent use of action separators");
            this.expect(separator);
         }
         actions.push( this.action(hands) );      
      }

      return actions;

   }

   action( hands ){

      if( hands.length === 1 ){
         this.autoset("actionBrackets", "(", "Inconsistent use of action brackets");
         return [ this.release(hands, hands[0]) ];
      }

      this.expect("(");

      const action = [ this.release(hands, hands[0]) ];


      const separators = [",", " "];
      const separated = this.upcoming(separators);

      for( let i = 1; i < hands.length; i++ ){
         if( separated ){
            const separator = this.autoset("releaseSeparator", separators, "Inconsistent use of release separators");
            this.expect(separator);
         }
         action.push( this.release(hands, hands[i]) );
      }

      this.expect(")");

      return action;

   }

   release( hands, hand ){

      // Rules for multiplex brackets are slightly more complicated:
      // grouping of 2+ tosses requires them, but they are allowed in
      // 1 toss releases as long as they are omnipresent :).

      const bracketed = this.upcoming("[");

      if( !bracketed ){
         this.set("releaseBrackets", false, "Inconsistent use of release brackets.");
         return [ this.toss(hands, hand) ];
      }


      this.expect("[");
      const release = [ this.toss(hands, hand) ];


      const separators = [",", " "];
      const separated = this.upcoming(separators);

      while( !this.upcoming("]") ){
         if( separated ){
            const separator = this.autoset("tossSeparator", separators, "Inconsistent use of toss separators");
            this.expect(separator);
         }
         release.push( this.toss(hands, hand) );
      }
  
      this.expect("]");

      if( release.length === 1 ){
         this.set("releaseBrackets", true, "Inconsistent use of release brackets.");
      }

      return release;

   }

   toss( hands, hand ){

      const value = parseInt(this.expect("value"));
      let handTo;

      if( !this.upcoming("hand") ){
         this.set("selfHand", true, "Same hand throws inconsistently denoted.");
         handTo = hand;
      }
      else{
         handTo = this.expect("hand");

         if( handTo === hand )
            this.set("selfHand", false, "Same hand throws inconsistently denoted.");
      }

      if( value === 0 )
         return new Toss(0, null, null);

      return new Toss(value, hands.indexOf(hand), hands.indexOf(handTo));

   }


}



let parser;

function parse( string, hands, legacy ){

   if( !parser )
      parser = new Parser();

   return parser.parse(string, hands, legacy);

}


export { parse };