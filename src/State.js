
import { Siteswap }    from "./Siteswap";
import { advance }     from "./State.advance";
import { equals }      from "./State.equals";
import { isExcited }   from "./State.isExcited";

// I'm not satisfied with the state of `State`, but being a temporary solution
// until the graph content (which will use `State`, `Transition` and `Siteswap`) 
// is introduced, it can keep on keeping on.

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
            const handState = [];
            for( let j = 0; j < siteswap.greatestValue; j++ )
               handState.push( strict ? [] : 0 );
            schedule.push(handState);
         }

         let balls = 0;
         for( let beat = -1; balls < siteswap.props; beat-- ){

            const action = siteswap.throws[((beat % siteswap.throws.length) + siteswap.throws.length) % siteswap.throws.length];
            for( const release of action ){
               for( const toss of release ){
                  if( beat + toss.value >= 0 ){
                     if( strict )
                        schedule[toss.handTo][beat + toss.value].push(balls);
                     else
                        schedule[toss.handTo][beat + toss.value]++;
                     balls++;
                  }
               }
            }
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