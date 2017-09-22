

import { parse }      from "./parser/parse";
import { alphabetic } from "../alphabetic";


const declaration = {

   hands: alphabetic,
   parse: parse.bind(null, "multihand"),
   unparse

};

export { declaration };



function unparse( throws ){

   const count = throws[0].length;
   const hands = alphabetic(count);
   const rows = [];
   for( let i = 0; i < count; i++ ){
      const row = throws.map(action => unparseRelease(action[i], hands)).join(",");
      rows.push(row);
   }
   return rows.join("\n");

}

function unparseRelease( release, hands ){

   const string = release.map(({value, handTo}) => `${hands[handTo]}${value}`).join(",");
   return release.length === 1 ? string : `[${string}]`;

}
