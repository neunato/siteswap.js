
import { Siteswap }    from "./Siteswap";
import { advance }     from "./State.advance";
import { equals }      from "./State.equals";
import { isExcited }   from "./State.isExcited";

// I'm not satisfied with the state of `State`, but being a temporary solution
// until the graph content is introduced, it can remain as is.

// `strict`ness should be removed from state if it's not used at all by the graph,
// and the `.strictStates` of a siteswap should be derived from the normal states.

class State {

   constructor( source, strict = false ){

      let schedule;

      // Find initial state of a given siteswap.
      if( source instanceof Array ){

         schedule = source;      

      }
      else if( source instanceof Siteswap ){

         schedule = [];

         const siteswap = source;
         for( let i = 0; i < siteswap.degree; i++ ){
            schedule.push( Array(siteswap.greatestValue).fill(0) )
         }

         let found = 0;
         for( let beat = -1; found < siteswap.props; beat-- ){
            const action = siteswap.throws[((beat % siteswap.throws.length) + siteswap.throws.length) % siteswap.throws.length];
            for( const release of action ){
               for( const toss of release ){
                  if( beat + toss.value >= 0 ){
                     schedule[toss.handTo][beat + toss.value]++;
                     found++;
                  }
               }
            }
         }

         if( strict ){
            let ball = 0;
            for( let i = 0; i < siteswap.degree; i++ )
               schedule[i] = schedule[i].map( c => Array(c).fill().map(() => ++ball) );
         }

      }
      else{
         throw new Error("Invalid input.")
      }

      this.schedule = schedule;
      this.strict = strict;
      this.ground = !this.isExcited();

   }

}

State.prototype.advance = advance;
State.prototype.equals = equals;
State.prototype.isExcited = isExcited;

export { State };