
import assert     from "assert"
import { get }    from "./register"
import { getAll } from "./register"



describe("Properties", () => {

   test("valid", {
      "{}": false,
      "[]": false,
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
      "[333]": true
   })

   // Parsing errors in `test/notations.js`.

   test("error", {
      "{}": "Invalid throws structure.",
      "[]": "Invalid throws structure.",
      "54": "Invalid siteswap."
   })

   test("input", {
      "{}": [{}, null],
      "[]": [[], null],
      "54": [[[[{ "value": 5, "from": 0, "to": 0 }]], [[{ "value": 4, "from": 0, "to": 0 }]]], null]
   })

   // Test the throws of all registered (valid) siteswaps.

   test("throws", getAll(false).filter(({ siteswap }) => siteswap.valid).reduce((r, s) => {
      r[s.name] = s.input
      return r
   }, {}))

   test("degree", {
      "54": undefined,
      "0": 1,
      "b": 1,
      "(4,2x)*": 2,
      "B3 | C3 | A3": 3
   })

   test("props", {
      "54": undefined,
      "0": 0,
      "b": 11,
      "(4,2x)*": 3,
      "B3 | C3 | A3": 9
   })

   test("multiplex", {
      "54": undefined,
      "0": 1,
      "b": 1,
      "[43]41": 2,
      "[333]": 3
   })

   test("greatestValue", {
      "54": undefined,
      "0": 0,
      "b": 11,
      "[43]41": 4,
      "(4,2x)*": 2,
      "B3 | C3 | A3": 3
   })

   test("period", {
      "54": undefined,
      "0": 1,
      "(4,2x)*": 2,
      "531531": 3
   })

   test("fullPeriod", {
      "54": undefined,
      "0": 1,
      "(4,2x)*": 2,
      "B3 | C3 | A3": 9,
      "[43]41": 12
   })

   test("groundState", {
      "54": undefined,
      "0": true,
      "(4,2x)*": true,
      "B3 | C3 | A3": true,
      "51": false,
      "51414": true,
      "315": true
   })

   test("prime", {
      "54": undefined,
      "0": true,
      "315": true,
      "(4,2x)*": true,
      "B3 | C3 | A3": true,
      "[333]": true,
      "51414": false
   })

   test("states", {
      "54": undefined,

      "b": [
         [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
      ],

      "531531": [
         [[1, 1, 1]],
         [[1, 1, 0, 0, 1]],
         [[1, 0, 1, 1]]
      ],

      "[43]41": [
         [[2, 1, 1]],
         [[1, 1, 1, 1]],
         [[1, 1, 1, 1]]
      ],

      "(4,2x)*": [
         [[1, 0], [1, 1]],
         [[1, 1], [1, 0]]
      ],

      "B3 | C3 | A3": [
         [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
      ]
   })

   test("strictStates", {
      "54": undefined,

      "b": [
         [[[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11]]],
         [[[2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [1]]],
         [[[3], [4], [5], [6], [7], [8], [9], [10], [11], [1], [2]]],
         [[[4], [5], [6], [7], [8], [9], [10], [11], [1], [2], [3]]],
         [[[5], [6], [7], [8], [9], [10], [11], [1], [2], [3], [4]]],
         [[[6], [7], [8], [9], [10], [11], [1], [2], [3], [4], [5]]],
         [[[7], [8], [9], [10], [11], [1], [2], [3], [4], [5], [6]]],
         [[[8], [9], [10], [11], [1], [2], [3], [4], [5], [6], [7]]],
         [[[9], [10], [11], [1], [2], [3], [4], [5], [6], [7], [8]]],
         [[[10], [11], [1], [2], [3], [4], [5], [6], [7], [8], [9]]],
         [[[11], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]]
      ],

      "531531": [
         [[[1], [2], [3]]],
         [[[2], [3], [], [], [1]]],
         [[[3], [], [2], [1]]],
         [[[3], [2], [1]]],
         [[[2], [1], [], [], [3]]],
         [[[1], [], [2], [3]]]
      ],

      "[43]41": [
         [[[1, 2], [3], [4]]],
         [[[3], [4], [2], [1]]],
         [[[4], [2], [1], [3]]],
         [[[2, 4], [1], [3]]],
         [[[1], [3], [4], [2]]],
         [[[3], [4], [2], [1]]],
         [[[4, 3], [2], [1]]],
         [[[2], [1], [3], [4]]],
         [[[1], [3], [4], [2]]],
         [[[3, 1], [4], [2]]],
         [[[4], [2], [1], [3]]],
         [[[2], [1], [3], [4]]]
      ],

      "(4,2x)*": [
         [
            [[1], []],
            [[2], [3]]
         ],
         [
            [[2], [1]],
            [[3], []]
         ]
      ],

      "B3 | C3 | A3": [
         [
            [[1], [2], [3]],
            [[4], [5], [6]],
            [[7], [8], [9]]
         ],
         [
            [[2], [3], [7]],
            [[5], [6], [1]],
            [[8], [9], [4]]
         ],
         [
            [[3], [7], [8]],
            [[6], [1], [2]],
            [[9], [4], [5]]
         ],
         [
            [[7], [8], [9]],
            [[1], [2], [3]],
            [[4], [5], [6]]
         ],
         [
            [[8], [9], [4]],
            [[2], [3], [7]],
            [[5], [6], [1]]
         ],
         [
            [[9], [4], [5]],
            [[3], [7], [8]],
            [[6], [1], [2]]
         ],
         [
            [[4], [5], [6]],
            [[7], [8], [9]],
            [[1], [2], [3]]
         ],
         [
            [[5], [6], [1]],
            [[8], [9], [4]],
            [[2], [3], [7]]
         ],
         [
            [[6], [1], [2]],
            [[9], [4], [5]],
            [[3], [7], [8]]
         ]
      ]

   })

   test("orbits", {
      "54": undefined,
      "531": [get("501"), get("030")],
      "531531": [get("501"), get("030")],
      "501": [get("501")],
      "423": [get("420"), get("003")],
      "5313": [get("5300"), get("0013")],
      "[43]41": [get("[43]41")],
      "[63]1[32]5": [get("[63]1[32]5")],
      "(4,2x)*": [get("(4,0)(0,0)"), get("(0,2x)(2x,0)"), get("(0,0)(0,4)")]
   })

   test("composition", {
      "54": undefined,
      "531": [get("531")],
      "531531": [get("531")],
      "51414": [get("51"), get("414")],
      "45141": [get("51"), get("441")],
      "3451413": [get("3"), get("51"), get("441")]
   })

})



describe("Methods", () => {

   test("rotate()", {
      "54": { args: [], error: (e) => e.name === "SiteswapError" && e.message === "Invalid siteswap." },
      "531": [
         { args: [-3], result: get("531") },
         { args: [-2], result: get("315") },
         { args: [-1], result: get("153") },
         { args: [0], result: get("531") },
         { args: [], result: get("315") },
         { args: [1], result: get("315") },
         { args: [2], result: get("153") },
         { args: [3], result: get("531") }
      ],
      "531531":  { args: [1], result: get("315") },
      "(4,2x)*": { args: [], result: get("(2x,4)(4,2x)") }
   })

   test("equals()", {
      "54":      { args: [], error: (e) => e.name === "SiteswapError" && e.message === "Invalid siteswap." },
      "(4,2x)*": { args: [get("(4,2x)(2x,4)")], result: true },
      "531531":  { args: [get("531")], result: true },
      "531":     { args: [get("315")], result: true }
   })


   // TODO: add toString() notation relevant tests: "Incompatible
   // notations.", "This siteswap can't be converted to the target notation."

   test("toString()", {
      "54": { args: [], error: (e) => e.name === "SiteswapError" && e.message === "Invalid siteswap." },
      "531": [
         { args: ["unsupported"], error: (e) => e.name === "SiteswapError" && e.message === "Unsupported notation." },
         { args: [null], result: JSON.stringify(get("531").throws) }
      ]
   })

   // Add tests for .log()? By overwriting console. Maybe add an output option?
   // Something like .log(console) and by default return a string?
})



function test(property, cases) {

   if (/\(\)$/.test(property))
      testMethod(property.slice(0, -2), cases)
   else
      testProperty(property, cases)

}

function testProperty(property, cases) {

   it(property, () => {

      const aliases = Object.keys(cases)
      for (const alias of aliases) {
         const value1 = get(alias)[property]
         const value2 = cases[alias]
         assert.deepStrictEqual(value1, value2, `.${property} mismatch at "${alias}"`)
      }

   })

}

function testMethod(property, cases) {

   it(property, () => {

      const aliases = Object.keys(cases)
      for (const alias of aliases) {
         const siteswap = get(alias)

         const calls = [].concat(cases[alias])
         for (const { args, result, error } of calls) {
            if (error)
               assert.throws(() => siteswap[property](...args), error)
            else
               assert.deepStrictEqual(siteswap[property](...args), result, `.${property}() mismatch at "${alias}"`)
         }
      }

   })

}
