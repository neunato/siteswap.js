
import { parse } from "./parser/parse";


function unparseToss({ value, handFrom, handTo }){
   
   return `${value * 2}${handFrom !== handTo ? "x" : ""}`;

}

const declaration = {

   limits: {
      degree: { min: 2, max: 2 },
      greatestValue: { max: 61 }
   },
   hands: () => ["Left", "Right"],
   parse: parse.bind(null, "compressed_sync"),
   unparse: throws => throws.map( action => "(" + action.map( release => release.length === 1 ? unparseToss(release[0]) : `[${release.map(unparseToss).join("")}]` ) + ")"  ).join("")

};

export { declaration };