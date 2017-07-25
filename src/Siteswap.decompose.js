
import { Siteswap }   from "./Siteswap";
import { Transition } from "./Transition";


function decompose( states, throws, notation ){

	const composition = [];

	let last = 0;
	for( let to = 1; to <= states.length; to++ ){

		for( let from = to - 1; from >= last; from-- ){
			if( states[to % states.length].equals(states[from]) ){
				if( from === 0 && to === states.length ){
					return [this];
				}

				if( from > last ){
					composition.push( new Transition(throws.slice(last, from), notation, states[last], states[from]) );
				}
				composition.push( new Siteswap(throws.slice(from, to), notation) );
				last = to;
				break;
			}
		}

	}

	if( last !== states.length ){
		composition.push( new Transition(throws.slice(last), notation) );
	}

	return composition;

}

export { decompose };