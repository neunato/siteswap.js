
import { Juggle } from "./Juggle";


class Transition extends Juggle {

	constructor( input, notation, stateFrom, stateTo ){

	  super(input, notation);

	  if( !this.valid )
	     return this;

	  this.stateFrom = stateFrom;
	  this.stateTo = stateTo;

	}

}

export { Transition };