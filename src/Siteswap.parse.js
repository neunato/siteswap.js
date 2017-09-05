
import { notations as declarations } from "./notations";


function parse( string, notations ){

   // Flatten composite notations ("standard" to "standard:async" and "standard:sync").
   notations = notations.reduce( (r, n) => r.concat(Array.isArray(declarations[n]) ? declarations[n] : n), [] );

   if( notations.some(notation => typeof notation !== "string" || !declarations[notation]) )
      throw new Error("Unsupported notation.");

   // The throws can be passed directly to avoid parsing siteswaps that derived
   // from others by manipulating their .throws.
   if( typeof string === "object" ){
      if( !validOutput(string) || notations.length > 1 )
         throw new Error("Invalid input.");
      return { notation: notations[0], throws: string };
   }

   // When passed a string, try parsing with passed notations, returning the 
   // first successful result.
   for( const notation of notations ){
      const [throws] = declarations[notation].parse(string);
      if( throws && validOutput(throws) )
         return { notation, throws };
   }

   throw new Error("Invalid syntax.");

}


function validOutput( throws ){
   
   if( !Array.isArray(throws) || !throws.length )
      return false;

   for( const action of throws ){
      if( !Array.isArray(action) || action.length !== throws[0].length )
         return false;

      if( action.some(release => !Array.isArray(release) || !release.every(({ value, handFrom, handTo }) => value !== undefined && handFrom !== undefined && handTo !== undefined)) )
         return false;
   }

   return true;

}


export { parse };

