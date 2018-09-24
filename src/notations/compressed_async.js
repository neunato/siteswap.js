
import { parse } from "./parser/parse"
import { ntoa }  from "../misc"


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
      const string = release.map(({ value }) => (value > 9 ? ntoa(value) : value)).join("")
      return release.length > 1 ? `[${string}]` : string
   }).join("")

}


export { declaration }
