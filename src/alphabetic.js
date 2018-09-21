
const offset = "A".charCodeAt(0)
const count = "Z".charCodeAt(0) - offset + 1


// Convert integer to an A-Z string (0 => A, 25 => Z, 26 => AA).

function alphabetic(int) {

   return "A".repeat(Math.floor(int / count)) + String.fromCharCode(offset + (int % count))

}


// Convert A-Z string to an integer (A => 0, Z => 25, AA => 26).

function numeric(string) {

   let i = 0
   while (string[i] === "A")
      i++

   if (i < string.length - 1)
      return null

   if (i === string.length)
      return (i - 1) * count

   return (i * count) + string[i].charCodeAt(0) - offset

}


export { alphabetic }
export { numeric }
