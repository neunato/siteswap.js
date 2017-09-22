
import assert                        from "assert";
import { Siteswap }                  from "../src/Siteswap";

import { tests as standard_async }   from "./notations/standard_async";
import { tests as standard_sync }    from "./notations/standard_sync";
import { tests as compressed_async } from "./notations/compressed_async";
import { tests as compressed_sync }  from "./notations/compressed_sync";
import { tests as passing_async }    from "./notations/passing_async";
import { tests as passing_sync }     from "./notations/passing_sync";
import { tests as multihand }        from "./notations/multihand";


const tests = {
   "standard:async": standard_async,
   "standard:sync": standard_sync,
   "compressed:async": compressed_async,
   "compressed:sync": compressed_sync,
   "passing:async": passing_async,
   "passing:sync": passing_sync,
   "multihand": multihand
};


describe("Notations", function(){

   const notations = Object.keys(tests);
   for( const notation of notations ){

      const strings = Object.keys(tests[notation]);

      describe(notation, function(){

         it("parsing", function(){
            for( const string of strings ){
               const siteswap = new Siteswap(string, notation);
               assertSiteswap(string, siteswap, tests[notation][string]);
            }
         });

         it("unparsing", function(){
            for( const string of strings ){

               const siteswap = new Siteswap(string, notation);
               if( !siteswap.valid ){
                  assert.throws( () => siteswap.toString(notation), /Invalid siteswap\./ );
               }
               else{
                  const unparsed = siteswap.toString(notation);
                  const { throws } = new Siteswap(unparsed, notation);
                  assertSiteswap(string, siteswap, { throws });
               }
            }
         });

      });

   }

});


function assertSiteswap( string, siteswap, properties ){

   // `.orbits` and `composition` are ignored because they contain siteswaps 
   // and `assert.deepStrictEqual()` compares `.toString()`s, which are 
   // implemented by the notation we're testing itself.

   // One solution would be to call `assertSiteswap()` for each juggle in
   // orbits/composition, but that would break on circular references unless
   // some sort of a cache is used.

   // Either way, this will have to wait until unit tests are introduced.

   const keys = Object.keys(properties).filter(key => key !== "orbits" && key !== "composition");
   for( const key of keys )
      assert.deepStrictEqual(siteswap[key], properties[key], `new Siteswap("${string}", "${siteswap.notation}").${key} === ${properties[key]}`);

}

