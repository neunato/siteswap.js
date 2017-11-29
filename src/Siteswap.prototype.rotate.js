
import { Siteswap } from "./Siteswap";


function rotate( count = 1 ){

   const throws = this.throws;

   if( count < 0 )
      count = throws.length + count % throws.length;

   return new Siteswap( [ ...throws.map((_, i) => throws[(i + count) % throws.length]) ], this.notation );

}


export { rotate };

