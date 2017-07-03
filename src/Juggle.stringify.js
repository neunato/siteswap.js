
function stringify( throws, hands ){

	if( hands.length === 1 ){

		return throws.map(function(action){
			const release = action[0];
			const string = release.map(toss => toss.value).join(",");
			return release.length === 1 ? string : ("[" + string + "]");
		}).join(",");

	}
	else{

		return throws.map(function(action){
			return "(" + action.map(function(release){
				const string = release.map(toss => toss.value + (toss.value === 0 ? "" : hands[toss.handTo])).join(",");
				return release.length === 1 ? string : ("[" + string + "]");
			}).join(",") + ")";
		}).join("");

	}

}

export { stringify };

