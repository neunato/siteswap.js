
import { parse } from "./parser/parse"


const declaration = {

   limits: {
      degree: { min: 2, max: 2 },
      greatestValue: { max: 61 }
   },
   hands: () => ["Left", "Right"],
   parse: (string) => parse("compressed_sync", string),
   unparse

}

function unparse(throws) {

   return throws.map((action) => {
      const result = action.map((release) => {
         const string = release.map(({ value, handFrom, handTo }) => `${value * 2}${handFrom === handTo ? "" : "x"}`).join("")
         return release.length > 1 ? `[${string}]` : string
      })
      return `(${result})`
   }).join("")

}


export { declaration }
