
import { parse }      from "./parser/parse"
import { alphabetic } from "../alphabetic"


const declaration = {

   hands: (n) => Array(n).fill().map((_, i) => alphabetic(i)),
   parse: (string) => parse("multihand", string),
   unparse

}

function unparse(throws) {

   return throws[0].map((_, i) => {
      return throws.map((action) => {
         const release = action[i]
         const string = release.map(({ value, handTo }) => `${alphabetic(handTo)}${value}`).join(",")
         return release.length === 1 ? string : `[${string}]`
      }).join(",")
   }).join("\n")

}


export { declaration }
