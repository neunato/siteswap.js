
import { parse } from "./parser/parse"


const declaration = {

   limits: {
      degree: { min: 2, max: 2 }
   },
   hands: () => ["Left", "Right"],
   parse: (string) => parse("standard_sync", string),
   unparse

}

function unparse(throws) {

   return throws.map((action) => {
      const result = action.map((release) => {
         const string = release.map(({ value, from, to }) => `${value * 2}${from === to ? "" : "x"}`).join(",")
         return release.length > 1 ? `[${string}]` : string
      })
      return `(${result})`
   }).join("")

}


export { declaration }
