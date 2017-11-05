
import { Siteswap }   from "./Siteswap";


// This is far from efficient as states are repeatedly compared with `.equals()`. I could map states to numbers,
// but that would be a temporary solution until the graph content arrives. Then, a map/array of known states will 
// be used, and `.equals()` will deal with references, not deep comparisons.

function decompose( states, throws, notation ){

	const composition = [];
   throws = [...throws];
   states = [...states];

   let last = 0;
	for( let to = 1; to <= states.length; to++ ){
		for( let from = to - 1; from >= last; from-- ){
			if( !states[to % states.length].equals(states[from]) )
            continue;

         let siteswap

         // Prime siteswap.
			if( from === 0 && to === states.length ){
            if( !composition.length )
               return [this]
            siteswap = new Siteswap(throws.slice(from, to), notation);
			}
         // Composite siteswaps, no transition.
         else if( last === from ){
            siteswap = new Siteswap(throws.slice(from, to), notation);
            last = to;
         }
         else{
            // Composite siteswaps with transition.
            siteswap = new Siteswap(throws.splice(from, to - from), notation);
            states.splice(from, to - from);
            to = last;
         }

         add(composition, siteswap);
         break;
		}
	}

	return composition;

}

function add( collection, siteswap ){
   
   if( !collection.some(item => siteswap.equals(item)) )
      collection.push(siteswap);

}


export { decompose };