
import { parse } from "./parser/parse"


const declaration = {

   limits: {
      degree: { min: 2 }
   },
   hands: (degree) => Array(degree).fill().map((_, i) => `juggler ${i + 1}`),
   parse: (string) => parse("passing_async", string),
   unparse

}

export { declaration }



function unparse(throws) {

   const count = throws[0].length
   const strings = []
   for (let i = 0; i < count; i++)
      strings.push(throws.map((action) => unparseRelease(action[i])).join(","))
   return `<${strings.join("|")}>`

}

function unparseRelease(release) {

   const string = release.map(({ value, handFrom, handTo }) => `${value}${handFrom === handTo ? "" : `p${handTo + 1}`}`).join(",")
   return release.length === 1 ? string : `[${string}]`

}
