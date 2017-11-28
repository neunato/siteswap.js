"use strict"

import assert                        from "assert"
import Siteswap                      from "../dist/siteswap"

import { tests as standard_async }   from "./notations/standard_async"
import { tests as standard_sync }    from "./notations/standard_sync"
import { tests as compressed_async } from "./notations/compressed_async"
import { tests as compressed_sync }  from "./notations/compressed_sync"
import { tests as passing_async }    from "./notations/passing_async"
import { tests as passing_sync }     from "./notations/passing_sync"
import { tests as multihand }        from "./notations/multihand"


const tests = {
   "standard:async": standard_async,
   "standard:sync": standard_sync,
   "compressed:async": compressed_async,
   "compressed:sync": compressed_sync,
   "passing:async": passing_async,
   "passing:sync": passing_sync,
   "multihand": multihand
}


describe("Notations", function(){

   const notations = Object.keys(tests)
   for( const notation of notations ){

      const strings = Object.keys(tests[notation])
      const cache = {}
      for( const string of strings )
         cache[string] = new Siteswap(string, notation)


      describe(notation, function(){

         it("parsing", function(){
            for( const string of strings ){
               const siteswap = cache[string]
               const properties = tests[notation][string]
               assertSiteswap(siteswap, properties, string)
            }
         })

         it("unparsing", function(){
            for( const string of strings ){
               const siteswap = cache[string]
               if( !siteswap.valid ){
                  assert.throws( () => siteswap.toString(notation), /Invalid siteswap\./ )
                  continue
               }
               const unparsed = siteswap.toString(notation)
               const properties = { throws: new Siteswap(unparsed, notation).throws }
               assertSiteswap(siteswap, properties, string)
            }
         })

      })

   }

})


function assertSiteswap( siteswap, properties, name ){

   for( const key of Object.keys(properties) )
      assert.deepStrictEqual(siteswap[key], properties[key], `new Siteswap("${name}", "${siteswap.notation}").${key} === ${properties[key]}`)

}

