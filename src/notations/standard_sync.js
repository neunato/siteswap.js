
import { parse } from "./parser/parse";


function unparseToss({ value, handFrom, handTo }){
   
   return `${value * 2}${handFrom !== handTo ? "x" : ""}`;

}

const declaration = {

   limits: {
      degree: { min: 2, max: 2 }
   },
   hands: () => ["Left", "Right"],
   parse: (string) => parse("standard_sync", string),
   unparse: (throws) => throws.map( action => "(" + action.map( release => release.length === 1 ? unparseToss(release[0]) : `[${release.map(unparseToss).join(",")}]` ) + ")"  ).join("")

};

export { declaration };




