
const tests = {

   // Validity.
   [` `]:                       { valid: false },
   [` 5`]:                      { valid: false },
   [`A3`]:                      { valid: true },
   [`A10`]:                     { valid: true },
   [`B3`]:                      { valid: false },
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
     B3`]:                      { valid: false },
   [`[A4,B3],A4,A1
     [A3,B5],B3,B1`]:           { valid: true },

   [`(0,10)`]:                  { valid: true },
   [`(1,10)`]:                  { valid: false },
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
};

export { tests };
