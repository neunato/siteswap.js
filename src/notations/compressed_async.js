
import { parse } from "./parser/parse";


const declaration = {

   limits: {
      degree: { min: 1, max: 1 },
      greatestValue: { max: 61 }
   },
   hands: () => ["Hand"],
   parse: (string) => parse("compressed_async", string),
   unparse: (throws) => throws.map( ([release]) => release.length === 1 ? release[0].value : `[${release.map(({ value }) => value).join("")}]`).join("")

};

export { declaration };