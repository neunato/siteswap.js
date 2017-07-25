
import { Parser }                from "nearley";
import { grammar as standard }   from "./notations/standard/parse";
import { grammar as compressed } from "./notations/compressed/parse";


const grammars = {
   standard,
   compressed
};

function parse( string, notation ){

   const grammar = grammars[notation];
   if( !grammar )
      throw new Error("Unsupported notation.");

   const parser = new Parser(grammar.ParserRules, grammar.parserStart);
   const results = parser.feed(string).results;
   if( !results.length )
      throw new Error("Invalid syntax.");
   return results[0];

}


export { parse };