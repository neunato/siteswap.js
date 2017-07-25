
import { Parser }                from "nearley";
import { grammar as standard }   from "./notations/standard/unparse";
import { grammar as compressed } from "./notations/compressed/unparse";


const grammars = {
   standard,
   compressed
};

function toString( notation = this.notation ){

   if( !this.valid )
      throw new Error("Can't call `.toString` on an invalid siteswap.")

   const grammar = grammars[notation];
   if( !grammar )
      throw new Error("Unsupported notation.");

   const parser = new Parser(grammar.ParserRules, grammar.parserStart);
   const string = JSON.stringify(this.throws);
   const results = parser.feed(string).results;
   return results[0];

}


export { toString };