
import { parse } from "./parser/parse"
import { dtobh } from "../misc"


const declaration = {

   hands: (n) => Array(n).fill().map((_, i) => dtobh(i)),
   parse: (string) => parse("multihand", string),
   unparse

}

function unparse(throws) {

   return throws[0].map((_, i) => {
      return throws.map((action) => {
         const release = action[i]
         const string = release.map(({ value, to }) => `${dtobh(to)}${value}`).join(",")
         return release.length === 1 ? string : `[${string}]`
      }).join(",")
   }).join("\n")

}


export { declaration }
