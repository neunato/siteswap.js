
import { notations as declarations } from "./notations";


function toString( notation = this.notation ){

   if( !this.valid )
      throw new Error("Invalid siteswap.");

   if( notation === null )
      return JSON.stringify(this.throws);

   if( !declarations[notation] || Array.isArray(declarations[notation]) )
      throw new Error("Unsupported notation.");

   // Check if they're compatible.
   if( this.notation !== notation ){
      const from = declarations[this.notation].limits || {};
      const to   = declarations[notation].limits || {};
      const properties = Object.keys(to);

      // Check if notations are compatible.
      if( properties.some(prop => to[prop] !== undefined && from[prop] !== undefined &&
                                 (to[prop].min !== undefined && from[prop].max !== undefined && to[prop].min > from[prop].max) ||
                                 (to[prop].max !== undefined && from[prop].min !== undefined && to[prop].max < from[prop].min)) )
         throw new Error("Incompatible notations.");

      // Check if calling siteswap exceeds some limit.
      if( properties.some(prop => (to[prop].max && this[prop] > to[prop].max) ||
                                  (to[prop].min && this[prop] < to[prop].min) ||
                                  (this[prop] % (to[prop].step || 1) !== 0)) )
         throw new Error("This siteswap can't be converted to the target notation.");
   }

   return declarations[notation].unparse(this.throws);

}

export { toString };