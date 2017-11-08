
import { parse } from "./parser/parse";


const declaration = {

   limits: {
      degree: { min: 4, step: 2 }
   },
   hands: degree => Array(degree).fill().map((_, i) => `juggler ${Math.floor(i / 2) + 1}, hand ${i % 2 + 1}`),
   parse: parse.bind(null, "passing_sync"),
   unparse

};

export { declaration };



function unparse( throws ){

   const count = throws[0].length;
   const strings = [];
   for( let i = 0; i < count; i += 2 )
      strings.push( throws.map( action => `(${unparseRelease(action[i])},${unparseRelease(action[i + 1])})` ).join("") );
   return `<${strings.join("|")}>`;

}

function unparseRelease( release ){
   
   const string = release.map( ({value, handFrom, handTo}) => `${value * 2}${handFrom % 2 !== handTo % 2 ? "x" : ""}${handTo === handFrom || handTo === handFrom + (handFrom % 2 ? -1 : 1) ? "" : ("p" + (Math.floor(handTo / 2) + 1))}` ).join(",");
   if( release.length === 1 )
      return string;
   else
      return `[${string}]`;

}
