
const codes = {
   "a": "a".charCodeAt(0),
   "A": "A".charCodeAt(0)
}


// Convert alphabetic letter to number (a => 10, z => 35, A => 36, Z => 61).

function aton(char) {

   if (typeof char !== "string")
      throw new Error("Expected string.")

   const code = char.charCodeAt(0)

   if (code >= 65 && code <= 90)      // Match A-Z.
      return 36 + code - codes.A

   if (code >= 97 && code <= 122)     // Match a-z.
      return 10 + code - codes.a

   throw new Error("Expected alphabetic letter in [a-Z] range.")

}

// Convert number to alphabetic letter (10 => a, 35 => z, 36 => A, 61 => Z).

function ntoa(n) {

   if (typeof n !== "number")
      throw new Error("Expected number.")

   if (n >= 10 && n <= 35)
      return String.fromCharCode(n + codes.a - 10)

   if (n >= 36 && n <= 61)
      return String.fromCharCode(n + codes.A - 36)

   throw new Error("Expected number in [10-61] range.")

}

// Bijective hexavigesimal to decimal number (A => 0, Z => 25, AA => 26, ZZ => 701, AAA => 702).

function bhtod(string) {

   if (typeof string !== "string")
      throw new Error("Expected string.")

   if (!/^[a-zA-Z]+$/.test(string))
      throw new Error("Expected alphabetic string.")

   return [...string].reduce((n, c, i, { length }) => n + ((c.charCodeAt(0) - codes.A + 1) * (26 ** (length - i - 1))), 0) - 1

}

// Decimal to bijective hexavigesimal number (0 => A, 25 => Z, 26 => AA, 701 => ZZ, 702 => AAA).

function dtobh(number) {

   if (typeof number !== "number")
      throw new Error("Expected number.")

   if (number < 0)
      throw new Error("Expected number in [0, ∞) range.")

   number++

   const result = []
   while (number > 0) {
      result.push(String.fromCharCode(codes.A + ((number - 1) % 26)))
      number = Math.floor((number - 1) / 26)
   }
   return result.reverse().join("")

}


export { aton }
export { ntoa }
export { bhtod }
export { dtobh }
