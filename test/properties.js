"use strict"

import assert                        from "assert"
import Siteswap                      from "../dist/siteswap"


// A list of predefined siteswaps, determined by their throw sequences (so as not to depend on any notation).
// Other properties are derived from throws anyway.

const siteswaps = {}

function register( name, throws ){
   
   if( siteswaps[name] )
      throw new Error(`Siteswap "${name}" already registered.`)
   
   const siteswap = new Siteswap(throws, null)
   siteswap.input = throws
   siteswaps[name] = siteswap

}

function get( name ){
   
   if( siteswaps[name] === undefined )
      throw new Error(`Siteswap ${name} not registered.`)
   return siteswaps[name]

}


register("0",             [[[{"value":0,"handFrom":0,"handTo":0}]]])
register("3",             [[[{"value":3,"handFrom":0,"handTo":0}]]])
register("b",             [[[{"value":11,"handFrom":0,"handTo":0}]]])
register("51",            [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]]])
register("51414",         [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]]])
register("45141",         [[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]]])
register("441",           [[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]]])
register("414",           [[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]]])
register("3451413",       [[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]]])
register("531",           [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]]])
register("315",           [[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":5,"handFrom":0,"handTo":0}]]])
register("153",           [[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]]])
register("5313",          [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]]])
register("5300",          [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]]])
register("0013",          [[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]]])
register("531531",        [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]]])
register("501",           [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]]])
register("300",           [[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]]])
register("030",           [[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]]])
register("003",           [[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]]])
register("423",           [[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":2,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0}]]])
register("420",           [[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":2,"handFrom":0,"handTo":0}]],[[{"value":0,"handFrom":0,"handTo":0}]]])
register("42",            [[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":2,"handFrom":0,"handTo":0}]]])
register("(4,2x)*",       [[[{"value":2,"handFrom":0,"handTo":0}],[{"value":1,"handFrom":1,"handTo":0}]],
                           [[{"value":1,"handFrom":0,"handTo":1}],[{"value":2,"handFrom":1,"handTo":1}]]])
register("(4,2x)(2x,4)",  [[[{"value":2,"handFrom":0,"handTo":0}],[{"value":1,"handFrom":1,"handTo":0}]],
                           [[{"value":1,"handFrom":0,"handTo":1}],[{"value":2,"handFrom":1,"handTo":1}]]])
register("(2x,4)(4,2x)",  [[[{"value":1,"handFrom":0,"handTo":1}],[{"value":2,"handFrom":1,"handTo":1}]],
                           [[{"value":2,"handFrom":0,"handTo":0}],[{"value":1,"handFrom":1,"handTo":0}]]])
register("(4,0)(0,0)",    [[[{"value":2,"handFrom":0,"handTo":0}],[{"value":0,"handFrom":1,"handTo":1}]],
                           [[{"value":0,"handFrom":0,"handTo":0}],[{"value":0,"handFrom":1,"handTo":1}]]])
register("(0,2x)(2x,0)",  [[[{"value":0,"handFrom":0,"handTo":0}],[{"value":1,"handFrom":1,"handTo":0}]],
                           [[{"value":1,"handFrom":0,"handTo":1}],[{"value":0,"handFrom":1,"handTo":1}]]])
register("(0,0)(0,4)",    [[[{"value":0,"handFrom":0,"handTo":0}],[{"value":0,"handFrom":1,"handTo":1}]],
                           [[{"value":0,"handFrom":0,"handTo":0}],[{"value":2,"handFrom":1,"handTo":1}]]])
register("B3 | C3 | A3",  [[[{"value":3,"handFrom":0,"handTo":1}],
                            [{"value":3,"handFrom":1,"handTo":2}],
                            [{"value":3,"handFrom":2,"handTo":0}]]])
register("[43]41",        [[[{"value":4,"handFrom":0,"handTo":0},{"value":3,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]]])
register("[333]",         [[[{"value":3,"handFrom":0,"handTo":0},{"value":3,"handFrom":0,"handTo":0},{"value":3,"handFrom":0,"handTo":0}]]])
register("[63]1[32]5",    [[[{"value":6,"handFrom":0,"handTo":0},{"value":3,"handFrom":0,"handTo":0}]],[[{"value":1,"handFrom":0,"handTo":0}]],[[{"value":3,"handFrom":0,"handTo":0},{"value":2,"handFrom":0,"handTo":0}]],[[{"value":5,"handFrom":0,"handTo":0}]]])


// More invalid inputs have to go here! This should be taken care of once errors are reworked.
register("hmmm",          { "not": "an array", "nor": "a string" })
register("54",            [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]]])





describe("Properties", function(){

   test("valid", {
      "hmmm": false,
      "54": false,
      "0": true,
      "b": true,
      "51": true,
      "51414": true,
      "315": true,
      "531531": true,
      "(4,2x)*": true,
      "B3 | C3 | A3": true,
      "[43]41": true,
      "[333]": true,
   })

   test("error", {
      // All possible error messages have to go here!
      // I have to rework the errors anyway (namely, extend Error), as they got public with .equals(). Then 
      // replace the .error string with the actual error.
      "hmmm": "Invalid throws structure.",
      "54": "Invalid siteswap.",
   })

   test("throws", Object.keys(siteswaps).reduce(function(result, name){
      const siteswap = siteswaps[name]
      if( siteswap.valid )
         result[name] = siteswaps[name].input
      return result
   }, {}))

   test("degree", {
      "0": 1,
      "b": 1,
      "(4,2x)*": 2,
      "B3 | C3 | A3": 3,
   })

   test("props", {
      "0": 0,
      "b": 11,
      "(4,2x)*": 3,
      "B3 | C3 | A3": 9,
   })

   test("multiplex", {
      "0": 1,
      "b": 1,
      "[43]41": 2,
      "[333]": 3,
   })

   test("greatestValue", {
      "0": 0,
      "b": 11,
      "[43]41": 4,
      "(4,2x)*": 2,
      "B3 | C3 | A3": 3,
   })

   test("period", {
      "0": 1,
      "(4,2x)*": 2,
      "531531": 3,
   })

   test("fullPeriod", {
      "0": 1,
      "(4,2x)*": 2,
      "B3 | C3 | A3": 9,
      "[43]41": 12,
   })

   test("groundState", {
      "0": true,
      "(4,2x)*": true,
      "B3 | C3 | A3": true,
      "51": false,
      "51414": true,
      "315": true,
   })

   test("prime", {
      "0": true,
      "315": true,
      "(4,2x)*": true,
      "B3 | C3 | A3": true,
      "[333]": true,
      "51414": false,
   })

   test("states", {
      "b":      [[[1,1,1,1,1,1,1,1,1,1,1]]],

      "531531": [[[1,1,1]],
                 [[1,1,0,0,1]],
                 [[1,0,1,1]]],

      "(4,2x)*": [[[1,0],
                   [1,1]],
                  [[1,1],
                   [1,0]]],

      "B3 | C3 | A3": [[[1,1,1],
                        [1,1,1],
                        [1,1,1]]],

      "[43]41": [[[2,1,1]],
                 [[1,1,1,1]],
                 [[1,1,1,1]]]
   })

   test("strictStates", {
       "b": [[[[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11]]],
             [[[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[1]]],
             [[[3],[4],[5],[6],[7],[8],[9],[10],[11],[1],[2]]],
             [[[4],[5],[6],[7],[8],[9],[10],[11],[1],[2],[3]]],
             [[[5],[6],[7],[8],[9],[10],[11],[1],[2],[3],[4]]],
             [[[6],[7],[8],[9],[10],[11],[1],[2],[3],[4],[5]]],
             [[[7],[8],[9],[10],[11],[1],[2],[3],[4],[5],[6]]],
             [[[8],[9],[10],[11],[1],[2],[3],[4],[5],[6],[7]]],
             [[[9],[10],[11],[1],[2],[3],[4],[5],[6],[7],[8]]],
             [[[10],[11],[1],[2],[3],[4],[5],[6],[7],[8],[9]]],
             [[[11],[1],[2],[3],[4],[5],[6],[7],[8],[9],[10]]]],
   
      "531531": [[[[1],[2],[3]]],
                 [[[2],[3],[],[],[1]]],
                 [[[3],[],[2],[1]]],
                 [[[3],[2],[1]]],
                 [[[2],[1],[],[],[3]]],
                 [[[1],[],[2],[3]]]],

      "(4,2x)*": [[[[1],[]],
                   [[2],[3]]],
                  [[[2],[1]],
                   [[3],[]]]],

      "B3 | C3 | A3": [[[[1],[2],[3]],
                        [[4],[5],[6]],
                        [[7],[8],[9]]],
                       [[[2],[3],[7]],
                        [[5],[6],[1]],
                        [[8],[9],[4]]],
                       [[[3],[7],[8]],
                        [[6],[1],[2]],
                        [[9],[4],[5]]],
                       [[[7],[8],[9]],
                        [[1],[2],[3]],
                        [[4],[5],[6]]],
                       [[[8],[9],[4]],
                        [[2],[3],[7]],
                        [[5],[6],[1]]],
                       [[[9],[4],[5]],
                        [[3],[7],[8]],
                        [[6],[1],[2]]],
                       [[[4],[5],[6]],
                        [[7],[8],[9]],
                        [[1],[2],[3]]],
                       [[[5],[6],[1]],
                        [[8],[9],[4]],
                        [[2],[3],[7]]],
                       [[[6],[1],[2]],
                        [[9],[4],[5]],
                        [[3],[7],[8]]]],

      "[43]41": [[[[1,2],[3],[4]]],
                 [[[3],[4],[2],[1]]],
                 [[[4],[2],[1],[3]]],
                 [[[2,4],[1],[3]]],
                 [[[1],[3],[4],[2]]],
                 [[[3],[4],[2],[1]]],
                 [[[4,3],[2],[1]]],
                 [[[2],[1],[3],[4]]],
                 [[[1],[3],[4],[2]]],
                 [[[3,1],[4],[2]]],
                 [[[4],[2],[1],[3]]],
                 [[[2],[1],[3],[4]]]]
   })

   test("orbits", {
      "531": ["501", "030"],
      "531531": ["501", "030"],
      "501": ["501"],
      "423": ["420", "003"],
      "5313": ["5300", "0013"],
      "[43]41": ["[43]41"],
      "[63]1[32]5": ["[63]1[32]5"],
      "(4,2x)*": ["(4,0)(0,0)", "(0,2x)(2x,0)", "(0,0)(0,4)"],
   })

   test("composition", {
      "531": ["531"],
      "531531": ["531"],
      "51414": ["51", "414"],
      "45141": ["51", "441"],
      "3451413": ["3", "51", "441"],
   })

   test("rotate()", {
      "531":    [{ args: [-3], result: "531" },
                 { args: [-2], result: "315" },
                 { args: [-1], result: "153" },
                 { args: [0],  result: "531" },
                 { args: [],   result: "315" },
                 { args: [1],  result: "315" },
                 { args: [2],  result: "153" },
                 { args: [3],  result: "531" }],
      "531531":  { args: [1], result: "315" },
      "(4,2x)*": { args: [], result: "(2x,4)(4,2x)" }
   })

   test("equals()", {
      "(4,2x)*": { args: [get("(4,2x)(2x,4)")], result: true },
      "531531":  { args: [get("531")],          result: true },
      "531":     { args: [get("315")],          result: true }
   })

})





function test( property, cases ){
   
   if( /\(\)$/.test(property) )
      testFunction( property.slice(0, -2), cases )
   else
      testProperty( property, cases )

}


// A siteswap's property can only have one value.

function testProperty( property, cases ){

   it(property, function(){

      const aliases = Object.keys(cases)
      for( const alias of aliases ){
         const siteswap = get(alias)

         const value1 = normalise(siteswap[property])
         const value2 = normalise(cases[alias])
         assert.deepStrictEqual( value1, value2, `.${property} mismatch at "${alias}"`)
      }

   })

}


// A function can be tested multiple times; once for every `{ args, result }` object (single or array) on the right side.

function testFunction( property, cases ){
   
   it(property, function(){

      const aliases = Object.keys(cases)
      for( const alias of aliases ){
         const siteswap = get(alias)

         const calls = [].concat(cases[alias])
         for( const { args, result } of calls ){
            const value1 = normalise( siteswap[property](...args) )
            const value2 = normalise( result )
            assert.deepStrictEqual( value1, value2, `.${property} mismatch at "${alias}"`)
         }
      }

   })

}


// If a given value represents a siteswap (be it directly as Siteswap, or as a registered string), return its
// `.throws`. Else return the passed value.

function normalise( value ){
   
   if( Array.isArray(value) )
      return value.map(normaliseSingle)

   return normaliseSingle(value)

}

function normaliseSingle( value ){
   
   if( value instanceof Siteswap )
      return value.throws

   if( typeof value !== "string" || !siteswaps[value] )
      return value

   return siteswaps[value].throws

}