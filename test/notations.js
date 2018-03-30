"use strict"

import assert   from "assert"
import Siteswap from "../dist/siteswap"


// Parser tests.

const tests = {

   "standard": ["standard:async", "standard:sync"],

   "standard:async": {

      // Validity.
      " ":                { valid: false },
      "šđžć":             { valid: false },
      "5":                { valid: true },
      "53":               { valid: true, period: 1 },
      "5,5,5":            { valid: true, period: 1 },
      "5,3":              { valid: true },
      "5 3":              { valid: true },
      "5,3,1":            { valid: true },
      "5,3 1":            { valid: false },
      "[5]":              { valid: false },
      "[5],3":            { valid: false },
      "[5][3]":           { valid: false },
      "[5],[3]":          { valid: false },
      "5[33]1":           { valid: false },
      "5[3,3]1":          { valid: false },
      "5,[33],1":         { valid: false },
      "5,[3,3],1":        { valid: true },

      // Whitespace.
      " 5":                { valid: true },
      "   5,[3,3],1":      { valid: true },
      "   5,[3,3],1   ":   { valid: true },
      "5,[   3,3   ],1":   { valid: true },
      "5,[ 3 , 3 ],1":     { valid: true },
      "5 , [3,3],1":       { valid: true },
      " 5 , [ 3 , 3 ] , 1 ":       { valid: true },

      // Parsing results.
      "0":                       { valid: true, throws: [[[{ value: 0, handFrom: 0, handTo: 0 }]]] },
      "5,1":                     { valid: true, throws: [[[{ value: 5, handFrom: 0, handTo: 0 }]],[[{ value: 1, handFrom: 0, handTo: 0 }]]] },
      "[3,1]":                   { valid: true, throws: [[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 1, handFrom: 0, handTo: 0 }]]] },
      "4,2,[3,3]":               { valid: true, throws: [[[{ value: 4, handFrom: 0, handTo: 0 }]],[[{ value: 2, handFrom: 0, handTo: 0 }]],[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 3, handFrom: 0, handTo: 0 }]]] }
   },

   "standard:sync": {

      // Validity.
      " ":                { valid: false },
      "šđžć":             { valid: false },
      "(44)":             { valid: false },
      "(4x4x)":           { valid: false },
      "(4,4)":            { valid: true },
      "(3,3)":            { valid: false },
      "(4x,4x)":          { valid: true },
      "(4,4)*":           { valid: true, period: 1 },
      "(4,4)(4,4)(4,4)":  { valid: true, period: 1 },
      "(4x,4x)(4,4)":     { valid: true },
      "(4x 4x)(4 4)":     { valid: true },
      "(4x,4x)(4 4)":     { valid: false },
      "(4x,4x),(4,4)":    { valid: false },
      "([44],0)":         { valid: false },
      "([4,4],0)":        { valid: true },
      "([44x],2x)":       { valid: false },
      "([2x2x],0)*":      { valid: false },
      "([2x,2x],0)*":     { valid: true },

      // Whitespace.
      "  (4,4)":                     { valid: true },
      "  (4,4)  ":                   { valid: true },
      "([2x,2x]  ,  0)*  ":          { valid: true },
      "([2x  ,  2x],0)*":            { valid: true },
      "([ 2x , 2x ],0)*":            { valid: true },
      "([2x,2x],0)   (0,[2x,2x])":   { valid: true },
      " ( [ 2x , 2x ] , 0) ( 0 , [2x , 2x ] ) ":   { valid: true },

      // Parsing results.
      "(0,0)":            { valid: true, throws: [[[{ value: 0, handFrom: 0, handTo: 0 }],[{ value: 0, handFrom: 1, handTo: 1 }]]] },
      "(4,2x)*":          { valid: true, throws: [[[{ value: 2, handFrom: 0, handTo: 0 }],[{ value: 1, handFrom: 1, handTo: 0 }]],[[{ value: 1, handFrom: 0, handTo: 1 }],[{ value: 2, handFrom: 1, handTo: 1 }]]] },
      "([4,4x],2x)":      { valid: true, throws: [[[{ value: 2, handFrom: 0, handTo: 0 },{ value: 2, handFrom: 0, handTo: 1 }],[{ value: 1, handFrom: 1, handTo: 0 }]]] }

   },

   "compressed": ["compressed:async", "compressed:sync"],

   "compressed:async": {

      // Validity.
      " ":                { valid: false },
      "šđžć":             { valid: false },
      "  5":              { valid: true },
      "5  ":              { valid: true },
      " 5 ":              { valid: true },
      "5":                { valid: true },
      "53":               { valid: true, period: 2 },
      "555":              { valid: true, period: 1 },
      "5,5":              { valid: false },
      "5,3":              { valid: false },
      "5 3":              { valid: false },
      "5,3,1":            { valid: false },
      "5,3 1":            { valid: false },
      "[5]":              { valid: false },
      "[5],3":            { valid: false },
      "[5][3]":           { valid: false },
      "[5],[3]":          { valid: false },
      "5[33]1":           { valid: true },
      "5[3,3]1":          { valid: false },
      "5,[33],1":         { valid: false },
      "5,[3,3],1":        { valid: false },

      // Parsing results.
      "0":                { valid: true, throws: [[[{ value: 0, handFrom: 0, handTo: 0 }]]] },
      "51":               { valid: true, throws: [[[{ value: 5, handFrom: 0, handTo: 0 }]],[[{ value: 1, handFrom: 0, handTo: 0 }]]] },
      "[31]":             { valid: true, throws: [[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 1, handFrom: 0, handTo: 0 }]]] },
      "42[33]":           { valid: true, throws: [[[{ value: 4, handFrom: 0, handTo: 0 }]],[[{ value: 2, handFrom: 0, handTo: 0 }]],[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 3, handFrom: 0, handTo: 0 }]]] }

   },

   "compressed:sync": {

      // Validity.
      " ":                { valid: false },
      "šđžć":             { valid: false },   
      "  (44)":           { valid: true },
      "(44)  ":           { valid: true },
      " (44) ":           { valid: true },
      "(44)":             { valid: true },
      "(4x4x)":           { valid: true },
      "(4,4)":            { valid: true },
      "(3,3)":            { valid: false },
      "(4x,4x)":          { valid: true },
      "(4,4)*":           { valid: true, period: 1 },
      "(4,4)(4,4)(4,4)":  { valid: true, period: 1 },
      "(4x,4x)(4,4)":     { valid: true },
      "(4x 4x)(4 4)":     { valid: true },
      "(4x,4x)(4 4)":     { valid: false },
      "(4x,4x),(4,4)":    { valid: false },
      "([44],0)":         { valid: true },
      "([4,4],0)":        { valid: false },
      "([44x],2x)":       { valid: true },
      "([2x2x],0)*":      { valid: true },
      "([2x,2x],0)*":     { valid: false },

      // Parsing results.
      "(0,0)":            { valid: true, throws: [[[{ value: 0, handFrom: 0, handTo: 0 }],[{ value: 0, handFrom: 1, handTo: 1 }]]] },
      "(4,2x)*":          { valid: true, throws: [[[{ value: 2, handFrom: 0, handTo: 0 }],[{ value: 1, handFrom: 1, handTo: 0 }]],[[{ value: 1, handFrom: 0, handTo: 1 }],[{ value: 2, handFrom: 1, handTo: 1 }]]] },
      "([44x],2x)":       { valid: true, throws: [[[{ value: 2, handFrom: 0, handTo: 0 },{ value: 2, handFrom: 0, handTo: 1 }],[{ value: 1, handFrom: 1, handTo: 0 }]]] }

   },

   "passing": ["passing:async", "passing:sync"],

   "passing:async": {

      // Validity.
      " ":                            { valid: false },
      "šđžć":                         { valid: false },
      "5|5":                          { valid: false },
      "<5,3,1>":                      { valid: false },
      "<5,3,1|4>":                    { valid: true },
      "<5,3,1,5,3,1,5,3,1|4>":        { valid: true, period: 3 },
      "<5 3 1|4 2>":                  { valid: true },
      "<5,3,1|5,3,1|4>":              { valid: true },
      "<5,[3,3],1|4>":                { valid: true },
      "<3p|3p>":                      { valid: true },
      "<3p|3p|3p>":                   { valid: false },
      "<3p2|3p1|3p>":                 { valid: false },
      "<3p,3,3|3p>":                  { valid: false, error: "Invalid siteswap." },
      "<3p,3,3|3p,3,3>":              { valid: true },
      "<3p1,3,3|3p,3,3>":             { valid: false },
      "<3p2,3,3|3p1,3,3>":            { valid: true },
      "<[3p,3p],3,3|[3p,3p],3,3>":    { valid: true },

      // Whitespace.
      "  <5|5>":                      { valid: true },
      "<5|5>  ":                      { valid: true },
      " <5|5> ":                      { valid: true },
      "< 5|5 >":                      { valid: true },
      "<5 | 5>":                      { valid: true },
      "< 5 |5>":                      { valid: true },
      "<5,[  3 , 3  ],1|4>":          { valid: true },
      " < [ 3p , 3p ] , 3 , 3 | [ 3p , 3p ] , 3 , 3 > ": { valid: true },

      // Parsing results.
      "<0|0>":                        { valid: true, throws: [[[{ value: 0, handFrom: 0, handTo: 0 }],[{ value: 0, handFrom: 1, handTo: 1 }]]] },
      "<[3 3]|5 1>":                  { valid: true, throws: [[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 3, handFrom: 0, handTo: 0 }],[{ value: 5, handFrom: 1, handTo: 1 }]],[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 3, handFrom: 0, handTo: 0 }],[{ value: 1, handFrom: 1, handTo: 1 }]]] },
      "<[3,3p],3,3|3p,3,3>":          { valid: true, throws: [[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 3, handFrom: 0, handTo: 1 }],[{ value: 3, handFrom: 1, handTo: 0 }]],[[{ value: 3, handFrom: 0, handTo: 0 }],[{ value: 3, handFrom: 1, handTo: 1 }]],[[{ value: 3, handFrom: 0, handTo: 0 }],[{ value: 3, handFrom: 1, handTo: 1 }]]] },
      "<3p|3p>":                      { valid: true, throws: [[[{ value: 3, handFrom: 0, handTo: 1 }],[{ value: 3, handFrom: 1, handTo: 0 }]]] },
      "<3p2|3p3|3p1>":                { valid: true, throws: [[[{ value: 3, handFrom: 0, handTo: 1 }],[{ value: 3, handFrom: 1, handTo: 2 }],[{ value: 3, handFrom: 2, handTo: 0 }]]] }

   },

   "passing:sync": {

      // Validity.
      " ":                                         { valid: false },
      "šđžć":                                      { valid: false },
      " 5":                                        { valid: false },
      "(4,4)|(4,4)":                               { valid: false },
      "<(4,4)|(4,4)>":                             { valid: true },
      "<(4 4)|(4 4)>":                             { valid: true },
      "<(3,3)|(4,4)>":                             { valid: false },
      "<(4x,4x)|(4,4)>":                           { valid: true },
      "<(4,2x)*|(4,4)>":                           { valid: true },
      "<(4,2x)(2x,4)|(4,4)>":                      { valid: true },
      "<(2,2)|(4,4)|(6,6)>":                       { valid: true },
      "<([4,2x],[2x,4])|(0,0)|(0,0)(0,0)>":        { valid: true, period: 1 },
      "<(4p,4)|(4p,4)>":                           { valid: true },
      "<(4p,4)|(4p,4)(4p,4)>":                     { valid: true, },
      "<(4p2,4)|(4p1,4)>":                         { valid: true },
      "<(4p,4)|(4p1,4)>":                          { valid: false },
      "<(4p3,4)|(4p1,4)>":                         { valid: false, error: "Invalid throws structure." },
      "<(2p2,2p2)|(2p3,2p3)|(2p1,2p1)>":           { valid: true },
      "<(2xp2,0)|(0,2xp3)|(2xp4,0)|(0,2xp1)>":     { valid: true },
      "<([2x,4xp],2x)|(2x,[4x,2xp])>":             { valid: true },
      "<([2x,4xp2],2x)|(2x,[4x,2xp1])>":           { valid: true },

      // Whitespace.
      "  <(4x,4x)|(4,4)>":                         { valid: true },
      "<(4x,4x)|(4,4)>  ":                         { valid: true },
      " <(4x,4x)|(4,4)> ":                         { valid: true },
      "< (4x,4x)|(4,4) >":                         { valid: true },
      "<(4x,4x) | (4,4)>":                         { valid: true },
      "< (4x,4x) |(4,4)>":                         { valid: true },
      "<([  4 , 2x  ],[2x,4])|(0,0)>":             { valid: true },
      " < ( [ 2x , 4xp2 ] , 2x ) | ( 2x , [ 4x , 2xp1 ] ) > ": { valid: true },

      // Parsing results.
      "<(0,0)|(0,0)>":                             { valid: true, throws: [[[{ value: 0, handFrom: 0, handTo: 0 }],[{ value: 0, handFrom: 1, handTo: 1 }],[{ value: 0, handFrom: 2, handTo: 2 }],[{ value: 0, handFrom: 3, handTo: 3 }]]] },
      "<(4,4)|(4,2x)*>":                           { valid: true, throws: [
                                                      [[{ value: 2, handFrom: 0, handTo: 0 }],[{ value: 2, handFrom: 1, handTo: 1 }],[{ value: 2, handFrom: 2, handTo: 2 }],[{ value: 1, handFrom: 3, handTo: 2 }]],
                                                      [[{ value: 2, handFrom: 0, handTo: 0 }],[{ value: 2, handFrom: 1, handTo: 1 }],[{ value: 1, handFrom: 2, handTo: 3 }],[{ value: 2, handFrom: 3, handTo: 3 }]]
                                                   ]},

      "<([6x,4p],4)(4,6x)|([4x,4p],6)(6,4x)>":     { valid: true, throws: [
                                                      [[{ value: 3, handFrom: 0, handTo: 1 },{ value: 2, handFrom: 0, handTo: 2 }],[{ value: 2, handFrom: 1, handTo: 1 }],[{ value: 2, handFrom: 2, handTo: 3 },{ value: 2, handFrom: 2, handTo: 0 }],[{ value: 3, handFrom: 3, handTo: 3 }]],
                                                      [[{ value: 2, handFrom: 0, handTo: 0 }],[{ value: 3, handFrom: 1, handTo: 0 }],[{ value: 3, handFrom: 2, handTo: 2 }],[{ value: 2, handFrom: 3, handTo: 2 }]]
                                                   ]},

      "<(6x,6xp2)|(6x,6xp3)|(6x,6xp4)|(6x,6xp1)>": { valid: true, throws:
                                                      [[[{ value: 3, handFrom: 0, handTo: 1 }],[{ value: 3, handFrom: 1, handTo: 2 }],[{ value: 3, handFrom: 2, handTo: 3 }],[{ value: 3, handFrom: 3, handTo: 4 }],[{ value: 3, handFrom: 4, handTo: 5 }],[{ value: 3, handFrom: 5, handTo: 6 }],[{ value: 3, handFrom: 6, handTo: 7 }],[{ value: 3, handFrom: 7, handTo: 0 }]]]
                                                   }

   },

   "multihand": {

      // Validity.
      [` `]:                       { valid: false },
      [` 5`]:                      { valid: false },
      [`A3`]:                      { valid: true },
      [`A10`]:                     { valid: true },
      [`B3`]:                      { valid: false, error: "Invalid throws structure." },
      [`A6,A4`]:                   { valid: true },
      [`A6,A4,A6,A4,A6,A4`]:       { valid: true, period: 2 },
      [`B3
        A3`]:                      { valid: true },
      [`A4,A2
        B5,B3,B1`]:                { valid: true },
      [`B3
        C3
        A3`]:                      { valid: true },
      [`B3
        B3`]:                      { valid: false, error: "Invalid siteswap." },
      [`[A4,B3],A4,A1
        [A3,B5],B3,B1`]:           { valid: true },

      [`(0,10)`]:                  { valid: true },
      [`(1,10)`]:                  { valid: false, error: "Invalid throws structure." },
      [`(0,6)(0,4)`]:              { valid: true },
      [`( 1,5)
        (-1,5)`]:                  { valid: true },
      [`( 1,5)
        ( 1,5)
        (-2,5)`]:                  { valid: true },
      [`[( 0,4)(1,3)](0,4)(0,1)
        [(-1,3)(0,5)](0,3)(0,1)`]: { valid: true },

      // Whitespace.
      [`A 6,A4`]:                   { valid: false },
      [`A6,A4`]:                    { valid: true },
      [`  A6,A4`]:                  { valid: true },
      [` A6,A4 `]:                  { valid: true },
      [`A6 , A4`]:                  { valid: true },
      [`[  A4 , B3  ],A4,A1
        [A3,B5], B3 , B1 `]:        { valid: true },

      [` (0,10)`]:                  { valid: true },
      [`(0,10) `]:                  { valid: true },
      [` (0,10) `]:                 { valid: true },
      [`(0,6) (0,4)`]:              { valid: true },
      [` (0 , 6)(0,4 )`]:           { valid: true },



      // Parsing results.
      [`A0`]:                                 { valid: true, throws: [[[{ value: 0, handFrom: 0, handTo: 0 }]]] },
      [`A5,A1`]:                              { valid: true, throws: [[[{ value: 5, handFrom: 0, handTo: 0 }]],[[{ value: 1, handFrom: 0, handTo: 0 }]]] },
      [`[A3,A1]`]:                            { valid: true, throws: [[[{ value: 3, handFrom: 0, handTo: 0 },{ value: 1, handFrom: 0, handTo: 0 }]]] },
      [`B4,B2,[A3,B3]
        A1,A5,[A3,B3]`]:                      { valid: true, throws: [[[{ value: 4, handFrom: 0, handTo: 1 }],[{ value: 1, handFrom: 1, handTo: 0 }]],
                                                                     [[{ value: 2, handFrom: 0, handTo: 1 }],[{ value: 5, handFrom: 1, handTo: 0 }]],
                                                                     [[{ value: 3, handFrom: 0, handTo: 0 },{ value: 3, handFrom: 0, handTo: 1 }],[{ value: 3, handFrom: 1, handTo: 0 },{ value: 3, handFrom: 1, handTo: 1 }]]] },
      [`( 1,4)( 1,2)[(0,3)( 1,3)]
        (-1,1)(-1,5)[(0,3)(-1,3)]`]:          { valid: true, throws: [[[{ value: 4, handFrom: 0, handTo: 1 }],[{ value: 1, handFrom: 1, handTo: 0 }]],
                                                                     [[{ value: 2, handFrom: 0, handTo: 1 }],[{ value: 5, handFrom: 1, handTo: 0 }]],
                                                                     [[{ value: 3, handFrom: 0, handTo: 0 },{ value: 3, handFrom: 0, handTo: 1 }],[{ value: 3, handFrom: 1, handTo: 1 },{ value: 3, handFrom: 1, handTo: 0 }]]] }

   }

}


describe("Notations", function(){

   it("default", function(){

      const siteswap = new Siteswap("3")
      assertSiteswap(siteswap, { valid: true, notation: "compressed:async" }, `new Siteswap("3") parsing mismatch.`)
   
   })

   it("unsupported", function(){

      let siteswap
      let properties

      siteswap = new Siteswap("3", "unsupported")
      properties = { valid: false, error: "Unsupported notation." }
      assertSiteswap(siteswap, properties, `3 (unsupported) parsing mismatch.`)

      siteswap = new Siteswap("3", null)
      properties = { valid: false, error: "Unsupported notation." }
      assertSiteswap(siteswap, properties, `3 (null) parsing mismatch.`)

      siteswap = new Siteswap([[[{ value: 3, handFrom: 0, handTo: 0 }]]], null)
      properties = { valid: true, error: undefined }
      assertSiteswap(siteswap, properties, `3 (direct) parsing mismatch.`)

   })


   const names = Object.keys(tests)
   for( const name of names ){

      describe(name, function(){

         const notations = Array.isArray(tests[name]) ? tests[name] : [name]

         it("parsing", function(){
            for( const notation of notations ){
               const cases = tests[notation]
               const strings = Object.keys(cases)
               for( const string of strings ){
                  const siteswap = new Siteswap(string, name)
                  const properties = tests[notation][string]
                  if( !properties.valid && !properties.error )
                     properties.error = "Invalid syntax."
                  assertSiteswap(siteswap, properties, `${string} (${siteswap.notation}) parsing mismatch.`)
               }
            }
         })

         it("unparsing", function(){
            for( const notation of notations ){
               const cases = tests[notation]
               const strings = Object.keys(cases)
               for( const string of strings ){
                  const siteswap = new Siteswap(string, name)
                  if( !siteswap.valid ){
                     continue
                  }

                  const unparsed = siteswap.toString(notation)
                  const properties = { throws: new Siteswap(unparsed, name).throws }
                  assertSiteswap(siteswap, properties, `${string} (${siteswap.notation}) unparsing mismatch.`)
               }
            }
         })

      })
      
   }

})



function assertSiteswap( siteswap, properties, message ){

   for( const key of Object.keys(properties) )
      assert.deepStrictEqual(siteswap[key], properties[key], message)

}

