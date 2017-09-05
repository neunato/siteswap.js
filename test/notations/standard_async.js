
const tests = {

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

};

export { tests };
