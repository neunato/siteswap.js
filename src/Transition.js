
import { Juggle } from "./Juggle";


class Transition extends Juggle {

	constructor( input, stateFrom, stateTo, legacy = true ){

	  super(input, legacy);

	  if( !this.valid )
	     return this;

	  this.stateFrom = stateFrom;
	  this.stateTo = stateTo;

	}

}

export { Transition };