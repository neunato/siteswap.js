"use strict"

import Siteswap                      from "../dist/siteswap"

// A list of predefined siteswaps, determined by their throw sequences (so as 
// not to depend on any notation), and identified by a string (ironically, in
// some notation).

// All other properties are derived from throws.


const siteswaps = {}

function register( name, throws, notation = null ){

   if( siteswaps[name] )
      throw new Error(`Siteswap "${name}" already registered.`)
   
   siteswaps[name] = {
      name,
      input: throws,
      siteswap: new Siteswap(throws, notation)
   }

}

function get( name, unwrap = true ){
   
   if( siteswaps[name] === undefined )
      throw new Error(`Siteswap ${name} not registered.`)
   return unwrap ? siteswaps[name].siteswap : siteswaps[name]

}

function getAll( unwrap = true ){
   
   return Object.keys(siteswaps).map(name => unwrap ? siteswaps[name].siteswap : siteswaps[name])

}


// Valid siteswaps.

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


// Invalid siteswaps.

register("{}",            {})
register("[]",            [])
register("54",            [[[{"value":5,"handFrom":0,"handTo":0}]],[[{"value":4,"handFrom":0,"handTo":0}]]])



export { get }
export { getAll }