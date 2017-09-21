
const tests = {

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
   "<(4p3,4)|(4p1,4)>":                         { valid: false },
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
};

export { tests };
