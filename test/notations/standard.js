
import { Toss } from "../../src/Toss";

const tests = {

   // Validity.
   " ":                { valid: false },
   " 5":               { valid: false },
   "šđžć":             { valid: false },
   "5":                { valid: true },
   "53":               { valid: true, period: 1 },
   "5,5":              { valid: true },
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

   "(44)":             { valid: false },
   "(4x4x)":           { valid: false },
   "(4,4)":            { valid: true },
   "(3,3)":            { valid: false },
   "(4x,4x)":          { valid: true },
   "(4,4)*":           { valid: true, period: 1 },
   "(4x,4x)(4,4)":     { valid: true },
   "(4x 4x)(4 4)":     { valid: true },
   "(4x,4x)(4 4)":     { valid: false },
   "(4x,4x),(4,4)":    { valid: false },
   "([44],0)":         { valid: false },
   "([4,4],0)":        { valid: true },
   "([44x],2x)":       { valid: false },
   "([2x2x],0)*":      { valid: false },
   "([2x,2x],0)*":     { valid: true },

   "(5)":              { valid: false },
   "([5])":            { valid: false },
   "(5),(3)":          { valid: false },

   // Parsing results.
   "0":                { valid: true, throws: [[[new Toss(0,0,0)]]] },
   "5,1":              { valid: true, throws: [[[new Toss(5,0,0)]],[[new Toss(1,0,0)]]] },
   "[3,1]":            { valid: true, throws: [[[new Toss(3,0,0),new Toss(1,0,0)]]] },
   "4,2,[3,3]":        { valid: true, throws: [[[new Toss(4,0,0)]],[[new Toss(2,0,0)]],[[new Toss(3,0,0),new Toss(3,0,0)]]] },

   "(0,0)":            { valid: true, throws: [[[new Toss(0,0,0)],[new Toss(0,1,1)]]] },
   "(4,2x)*":          { valid: true, throws: [[[new Toss(2,0,0)],[new Toss(1,1,0)]],[[new Toss(1,0,1)],[new Toss(2,1,1)]]] },
   "([4,4x],2x)":      { valid: true, throws: [[[new Toss(2,0,0),new Toss(2,0,1)],[new Toss(1,1,0)]]] }

};

export { tests };
