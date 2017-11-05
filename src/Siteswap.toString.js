
import { notations as declarations } from "./notations";


function toString( notation = this.notation ){

   if( !this.valid )
      throw new Error("Invalid siteswap.");

   if( notation === null )
      return JSON.stringify(this.throws);

   if( !declarations[notation] )
      throw new Error("Unsupported notation.");

   // Check if they're compatible.
   if( this.notation !== notation ){
      const limitsFrom = declarations[this.notation].limits || {};
      const limitsTo = declarations[notation].limits || {};
      const properties = Object.keys(limitsTo);

      if( properties.some(property => limitsTo[property].min > limitsFrom[property].max || limitsTo[property].max < limitsFrom[property].min) )
         throw new Error("Incompatible notations.");

      if( properties.some(property => this[property] > limitsTo[property].max || this[property] < limitsTo[property].min) )
         throw new Error("This siteswap can't be converted to the target notation.");
   }

   return declarations[notation].unparse(this.throws);

}

export { toString };