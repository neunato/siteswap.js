

import { parse }      from "./parser/parse";
import { alphabetic } from "../alphabetic";


const declaration = {

   hands: (n) => Array(n).fill().map((_, i) => alphabetic(i)),
   parse: (string) => parse("multihand", string),
   unparse

};

export { declaration };



function unparse( throws ){

   const count = throws[0].length;
   const rows = [];
   for( let i = 0; i < count; i++ ){
      const row = throws.map(action => unparseRelease(action[i])).join(",");
      rows.push(row);
   }
   return rows.join("\n");

}

function unparseRelease( release ){

   const string = release.map(({ value, handTo }) => `${alphabetic(handTo)}${value}`).join(",");
   return release.length === 1 ? string : `[${string}]`;

}
