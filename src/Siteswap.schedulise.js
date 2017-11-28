
import { getInitialState } from "./graph";


function schedulise( throws ){

   const states = [];
   const first = getInitialState(this);
   let last = first
   do {
      for( const action of throws ){
         states.push( last.schedule );
         last = last.advance(action);
      }
   } while( first !== last );

	return states;

}


export { schedulise };