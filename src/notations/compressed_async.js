
import { parse } from "./parser/parse"


const declaration = {

   limits: {
      degree: { min: 1, max: 1 },
      greatestValue: { max: 61 }
   },
   hands: () => ["Hand"],
   parse: (string) => parse("compressed_async", string),
   unparse

}

function unparse(throws) {

   return throws.map(([release]) => {
      const string = release.map(({ value }) => value).join("")
      return release.length > 1 ? `[${string}]` : string
   }).join("")

}


export { declaration }
