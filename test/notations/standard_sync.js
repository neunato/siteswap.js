
const tests = {

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

};

export { tests };
