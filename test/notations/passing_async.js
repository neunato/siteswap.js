
const tests = {

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
   "<3p,3,3|3p>":                  { valid: false },
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

};

export { tests };
