
import { Siteswap }   from "./Siteswap";


// This is far from efficient as states are repeatedly compared with `.equals()`. I could map states to numbers,
// but that would be a temporary solution until the graph content arrives. Then, a map/array of known states will 
// be used, and `.equals()` will deal with references, not deep comparisons.

// Also, should siteswap repetitions be included in `.composition`? Right now, they are.

function decompose( states, throws, notation ){

	const composition = [];

   let last = 0;
	for( let to = 1; to <= states.length; to++ ){

		for( let from = to - 1; from >= last; from-- ){
			if( states[to % states.length].equals(states[from]) ){

            // Prime siteswap.
				if( from === 0 && to === states.length ){
					return [this];
				}

            // Composite siteswaps, no transition.
            if( last === from ){
               composition.push( new Siteswap(throws.slice(from, to), notation) );
               last = to;
               break;
            }

            // Composite siteswaps with transition.
            const strippedThrows = [...throws];
            const strippedStates = [...states];

            composition.push( new Siteswap(strippedThrows.splice(from, to - from), notation) );
            strippedStates.splice(from, to - from);

            return composition.concat( decompose( strippedStates.slice(last), strippedThrows.slice(last), notation ) );
			}
		}

	}

	return composition;

}

export { decompose };