
import { Siteswap } from "./Siteswap";


function decompose( states, throws, notation ){

	const composition = [];
   throws = [...throws];
   states = [...states];

   let last = 0;
	for( let to = 1; to <= states.length; to++ ){
		for( let from = to - 1; from >= last; from-- ){
			if( states[to % states.length] !== states[from] ){
            continue;
         }

         // Prime siteswap.
			if( from === 0 && to === states.length ){
            if( !composition.length )
               return [this]
            const siteswap = new Siteswap(throws.slice(from, to), notation);
            add(composition, siteswap);
            return composition;
			}

         // Composite siteswaps, no transition.
         if( last === from ){
            const siteswap = new Siteswap(throws.slice(from, to), notation);
            add(composition, siteswap);
            last = to;
         }
         else{
            // Composite siteswaps with transition.
            const siteswap = new Siteswap(throws.splice(from, to - from), notation);
            states.splice(from, to - from);
            add(composition, siteswap);
            to = last;
         }
         break;
			
		}
	}

	return composition;

}


function add( collection, siteswap ){

   if( collection.every(item => !item.equals(siteswap)) )
      collection.push(siteswap);

}


export { decompose };