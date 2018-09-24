
import { parse } from "./parser/parse"


const declaration = {

   limits: {
      degree: { min: 2 }
   },
   hands: (degree) => Array(degree).fill().map((_, i) => `juggler ${i + 1}`),
   parse: (string) => parse("passing_async", string),
   unparse

}

function unparse(throws) {

   const result = throws[0].map((_, i) => {
      return throws.map((action) => {
         const release = action[i]
         const string = release.map(({ value, handFrom, handTo }) => `${value}${handFrom === handTo ? "" : `p${handTo + 1}`}`).join(",")
         return release.length > 1 ? `[${string}]` : string
      }).join(",")
   }).join("|")
   return `<${result}>`

}


export { declaration }
