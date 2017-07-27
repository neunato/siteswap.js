
import { deepStrictEqual } from "assert";
import { Siteswap } from "../src/Siteswap";
import { tests as standard } from "./notations/standard";
import { tests as compressed } from "./notations/compressed";


const tests = {
   standard,
   compressed
};


describe("Notations", function(){

   const notations = Object.keys(tests);
   for( const notation of notations ){

      it(notation, function(){

         const strings = Object.keys(tests[notation]);

         for( const string of strings ){

            const siteswap = new Siteswap(string, notation);

            // Parsing.
            assertSiteswap(siteswap, tests[notation][string]);

            if( !siteswap.valid )
               continue;

            // Unparsing.
            const unparsed = siteswap.toString(notation);
            const reversed = new Siteswap(unparsed, notation);
            assertSiteswap(siteswap, reversed);

         }
         
      });
   }

});


function assertSiteswap( siteswap, properties ){

   // `.input` is ignored because it depends on the user.
   // `.orbits` and `composition` are ignored because they contain siteswaps 
   // and `assert.deepStrictEqual()` compares `.toString()`s, which are 
   // implemented by the notation we're testing itself.

   // One solution would be to call `assertSiteswap()` for each juggle in
   // orbits/composition, but that would break on circular references unless
   // some sort of a cache is used. Since `.input` can be an array, I can't
   // make a cache map unless `.toString()` is used, or there was a way to 
   // test equality of two siteswaps (where 531 === 315).

   const keys = Object.keys(properties).filter(key => !["input", "orbits", "composition"].includes(key));
   for( const key of keys )
      deepStrictEqual(siteswap[key], properties[key], `new Siteswap("${siteswap.input}", "${siteswap.notation}").${key} !== ${properties[key]}`);

}

