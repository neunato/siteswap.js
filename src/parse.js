
import { notations as declarations } from "./notations";


function parse( string, notations ){

   // Flatten composite notations ("standard" to "standard:async" and "standard:sync").
   notations = notations.reduce( (r, n) => r.concat(Array.isArray(declarations[n]) ? declarations[n] : n), [] );

   // .throws can be passed directly as an array to avoid parsing siteswaps that derived 
   // from others by direct manipulation. In that case, the first notation of the list 
   // will be assigned and it can be null.
   if( typeof string === "object" ){
      const notation = notations[0];
      if( (typeof notation !== "string" || !declarations[notation]) && notation !== null )
         throw new Error("Unsupported notation.");
      return { notation, throws: string };
   }

   // Check if notations exists.
   if( notations.some(notation => typeof notation !== "string" || !declarations[notation]) )
      throw new Error("Unsupported notation.");

   // When passed a string, try parsing with wanted notations, returning the first 
   // successful result.
   for( const notation of notations ){
      const [throws] = declarations[notation].parse(string);
      if( throws )
         return { notation, throws };
   }

   throw new Error("Invalid syntax.");

}


export { parse };

