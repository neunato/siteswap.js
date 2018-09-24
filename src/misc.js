
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


export { aton }
export { ntoa }
