
import { parse } from "./parser/parse"


const declaration = {

   limits: {
      degree: { min: 1, max: 1 }
   },
   hands: () => ["Hand"],
   parse: (string) => parse("standard_async", string),
   unparse

}

function unparse(throws) {

   return throws.map(([release]) => {
      const string = release.map(({ value }) => value).join(",")
      return release.length > 1 ? `[${string}]` : string
   }).join(",")

}


export { declaration }
