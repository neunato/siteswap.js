
import { Siteswap }   from "./Siteswap";
import { Transition } from "./Transition";


function decompose( states, throws, hands ){

	const composition = [];

	let last = 0;
	for( let to = 1; to <= states.length; to++ ){

		for( let from = to - 1; from >= last; from-- ){
			if( states[to % states.length].equals(states[from]) ){
				if( from === 0 && to === states.length ){
					return [this];
				}

				if( from > last ){
					composition.push( new Transition({ hands: hands, siteswap: throws.slice(last, from)}, states[last], states[from]) );
				}
				composition.push( new Siteswap({ hands: hands, siteswap: throws.slice(from, to) }) );
				last = to;
				break;
			}
		}

	}

	if( last !== states.length ){
		composition.push( new Transition({ hands: hands, siteswap: throws.slice(last)}) );
	}

	return composition;

}

export { decompose };