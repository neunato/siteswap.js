
function unique( array ){

	return array.reduce(function(result, current){
		if( !result.includes( current ) )
			result.push( current );
		return result;
	}, []);

}

const unspecial = /^[a-z]$/i;

function validateHands( hands ){

	if( !Array.isArray(hands) || !hands.length || !hands.every(hand => typeof hand === "string" && unspecial.test(hand)) || unique(hands).length !== hands.length )
		throw new Error("Invalid hand sequence.");

};

export { validateHands };