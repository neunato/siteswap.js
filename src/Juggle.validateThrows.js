
import { Toss } from "./Toss";


function validateThrows( throws ){

	if( !Array.isArray(throws) || !throws.length )
		throw new Error("Invalid throw sequence.");

	for( const action of throws ){
		if( !Array.isArray(action) || action.length !== throws[0].length )
			throw new Error("Invalid throw sequence.");

		if( action.some(release => !Array.isArray(release) || !release.every(toss => toss instanceof Toss)) )
			throw new Error("Invalid throw sequence.");
	}

};

export { validateThrows };