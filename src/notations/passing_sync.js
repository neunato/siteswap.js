
import { parse } from "./parser/parse"


const declaration = {

   limits: {
      degree: { min: 4, step: 2 }
   },
   hands: (degree) => Array(degree).fill().map((_, i) => `juggler ${Math.floor(i / 2) + 1}, hand ${(i % 2) + 1}`),
   parse: (string) => parse("passing_sync", string),
   unparse

}

function unparse(throws) {

   const strings = []
   for (let i = 0, [{ length }] = throws; i < length; i += 2)
      strings.push(throws.map((action) => `(${unparseRelease(action[i])},${unparseRelease(action[i + 1])})`).join(""))
   return `<${strings.join("|")}>`

}

function unparseRelease(release) {

   const string = release.map(({ value, from, to }) => {
      const cross = from % 2 === to % 2 ? "" : "x"
      const pass = to === from || to === (from + (from % 2 ? -1 : 1)) ? "" : `p${Math.floor(to / 2) + 1}`
      return `${value * 2}${cross}${pass}`
   }).join(",")
   return release.length > 1 ? `[${string}]` : string

}


export { declaration }
