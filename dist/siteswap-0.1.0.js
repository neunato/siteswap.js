(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Siteswap = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

function Toss( value, handFrom, handTo ){

	this.value = value;
	this.handFrom = handFrom;
	this.handTo = handTo;

}

// If there is anything that needs refactoring, it's this file. The entire 
// legacy parser bit sucks. I should rebuild it along with a passing notation 
// parser, possibly multihand too.

// The generic notation itself, or its legacy extension, has some issues:
// - (5) is treated as an invalid sync pattern
// - [15][1] is treated as [1,5],1 instead of 15,1


class Token {
   
   constructor( type, value = null ){
      this.type = type;
      this.value = value;
   }

}

class Tokeniser {

   tokenise( string, patterns ){

      const tokens = [];
      const keys = Object.keys(patterns);

      let substring = string;
      while( substring.length ){

         if( !keys.some( (key) => {

            const match = substring.match(patterns[key]);
            if( match ){
               const value = match[0];
               tokens.push( new Token(key, value) );
               substring = substring.slice(value.length);
               return true;
            }

            return false;

         }) ){
            throw new Error("Unsupported character.");
         }

      }

      tokens.push( new Token("end") );

      return tokens;

   }

}

class GenericTokeniser extends Tokeniser {

   constructor(){

      super();

      this.tokenTypes = {
         "[":     /^\[/,
         "]":     /^\]/,
         "(":     /^\(/,
         ")":     /^\)/,
         ",":     /^,/,
         " ":     /^ /,
         "value": /^(?:(?:[1-9][0-9]+)|[0-9])/,
         "hand":  /^[a-zA-Z]+/
      };

   }

   tokenise( string ){

      return super.tokenise(string, this.tokenTypes);

   }

}

// After parsing, this one modifies tokens to match the generic parser rules.
// While doing that, it also checks for some errors (like odd sync throw values,
// mixing of letters and double digit numbers, and invalid sync mirror structure).

class LegacyTokeniser extends Tokeniser {

   constructor(){

      super();

      this.tokenTypes = {
         "legacy": {
            "[":     /^\[/,
            "]":     /^\]/,
            "(":     /^\(/,
            ")":     /^\)/,
            ",":     /^,/,
            " ":     /^ /,
            "cross": /^x/,
            "value": /^(?:(?:[1-9][0-9]+)|[0-9]|[a-zA-Z])/,
            "mirror": /^\*/
         },

         "legacyCompressed": {
            "[":     /^\[/,
            "]":     /^\]/,
            "(":     /^\(/,
            ")":     /^\)/,
            ",":     /^,/,       // Only possible between actions.
            " ":     /^ /,       // Only possible between actions.
            "cross": /^x/,
            "value": /^(?:[0-9]|[a-zA-Z])/,
            "mirror": /^\*/
         }
      };

   }

   numerify( tokens ){

      const alpha = /^[a-z]$/i;
      const numeric = /^[1-9][0-9]+$/;

      const letters = tokens.some(token => alpha.test(token.value));
      const digits = tokens.some(token => numeric.test(token.value));
      if( letters && digits ){
         throw new Error("Inconsistent use of letters and double digit throw values.");
      }

      if( letters ){
         const offset = {
            "a": -("a".charCodeAt(0)) + 10,
            "A": -("A".charCodeAt(0)) + 36
         };
         for( const token of tokens ){
            if( /[a-z]/.test(token.value) )
              token.value = token.value.charCodeAt(0) + offset["a"];
            else if( /[A-Z]/.test(token.value) )
              token.value = token.value.charCodeAt(0) + offset["A"];
         }
      }

   }

   separate( tokens ){

      const refined = [];
      for( let i = 0; i < tokens.length - 1; i++ ){
         refined.push( tokens[i] );
         if( (tokens[i].type === "value" || tokens[i].type === "hand") && tokens[i + 1].type === "value" )
            refined.push( new Token(",", ",") );
      }
      refined.push(tokens[tokens.length - 1]);
      return refined;

   }

   halve( tokens ){

      for( const token of tokens ){
         const value = parseInt(token.value);
         if( value % 2 === 1 )
            throw new Error("Legacy sync mode allows only odd throw values.");
         token.value = value / 2;
      }

   }

   handify( tokens, hands ){

      const refined = [];

      for( let i = 0; i < tokens.length; i++ ){

         if( tokens[i].type === "("  &&  i + 1 < tokens.length  &&  tokens[i + 1].type === "value" ){

            refined.push( tokens[i++] );   // (
            refined.push( tokens[i++] );   // value
            let hand;
            if( tokens[i].type === "cross" ){
               hand = hands[1];
            }
            else{
               hand = hands[0];
               i--;
            }
            refined.push( new Token("hand", hand) );
            continue;
         }


         if( tokens[i].type === "value"  &&  ((i + 1 < tokens.length && tokens[i + 1].type === ")") || (i + 2 < tokens.length && tokens[i + 2].type === ")")) ){

            refined.push( tokens[i++] );   // value
            let hand;
            if( tokens[i].type === "cross" ){
               hand = hands[0];
            }
            else{
               hand = hands[1];
               i--;
            }
            refined.push( new Token("hand", hand) );
            refined.push( tokens[++i] );
            continue;
         }

         refined.push( tokens[i] );

      }

      return refined;

   }

   tokenise( string, hands ){

      const sync = string.includes("(");
      const compressed = (sync  ?  /\([^)]*[, ].*\)/  :  /[, ]/).test(string);
      const types = this.tokenTypes[compressed ? "legacy" : "legacyCompressed"];

      let tokens = super.tokenise(string, types);
      const values = tokens.filter( token => token.type === "value" );

      // Convert letters to numbers.
      this.numerify(values);

      // Insert separators if compressed.
      if( compressed )
         tokens = this.separate(tokens);

      // Halve synchronous throw values.
      if( sync )
         this.halve(values);

      // Specify hands.
      tokens = this.handify(tokens, hands);

      return tokens;

   }

}



class Parser {

   constructor(){

      this.state = null;
      this.tokens = null;
      this.legacyTokeniser = new LegacyTokeniser();
      this.genericTokeniser = new GenericTokeniser();

   }

   // Check if the upcoming token(s) are of a given type, without advancing.
   upcoming( types ){

      if( typeof types === "string" )
         return this.tokens[this.tokens.length - 1].type === types;

      return types.some( type => this.tokens[this.tokens.length - 1].type === type );

   }

   // Return the next token's value if it of a given type, or throw if not.
   expect( type, message = "Unexpected token." ){
   
      if( !this.upcoming(type) )
         throw new Error(message);
      return this.tokens.pop().value;

   }


   set( name, value, message ){

      if( this.state[name] === undefined )
         this.state[name] = value;

      else if( this.state[name] !== value )
         throw new Error(message);

   }

   autoset( name, tokenTypes, message ){

      for( const type of tokenTypes ){
         if( this.upcoming(type) ){
            this.set(name, type, message);
            return type;
         }
      }
      this.set(name, null, 'Expecting "' + this.state[name] + '", got "' + this.tokens[this.tokens.length - 1].type + '".');
      return null;

   }

   /////////////////////////////////////////////////////////////////

   parse( string, hands, legacy ){

      this.state = {};
      
      // Get rid of all the insignifant spaces leaving only separator spaces behind.
      const siteswap = string.trim().replace(/  +/g, " ").replace(/ ?([[,]|[\],]) ?/g, "$1");
      if( siteswap === "" )
         throw new Error("No siteswap supplied.");

      const tokeniser = legacy ? this.legacyTokeniser : this.genericTokeniser;
      this.tokens = tokeniser.tokenise(siteswap, hands).reverse();

      return this.siteswap(hands);

   }

   siteswap( hands ){

      const actions = [ this.action(hands) ];

      const separators = [",", " "];
      const separated = this.upcoming(separators);

      while( !this.upcoming("end") ){
         if( separated ){
            const separator = this.autoset("actionSeparator", separators, "Inconsistent use of action separators");
            this.expect(separator);
         }
         actions.push( this.action(hands) );      
      }

      return actions;

   }

   action( hands ){

      if( hands.length === 1 ){
         this.autoset("actionBrackets", "(", "Inconsistent use of action brackets");
         return [ this.release(hands, hands[0]) ];
      }

      this.expect("(");

      const action = [ this.release(hands, hands[0]) ];


      const separators = [",", " "];
      const separated = this.upcoming(separators);

      for( let i = 1; i < hands.length; i++ ){
         if( separated ){
            const separator = this.autoset("releaseSeparator", separators, "Inconsistent use of release separators");
            this.expect(separator);
         }
         action.push( this.release(hands, hands[i]) );
      }

      this.expect(")");

      return action;

   }

   release( hands, hand ){

      // Rules for multiplex brackets are slightly more complicated:
      // grouping of 2+ tosses requires them, but they are allowed in
      // 1 toss releases as long as they are omnipresent :).

      const bracketed = this.upcoming("[");

      if( !bracketed ){
         this.set("releaseBrackets", false, "Inconsistent use of release brackets.");
         return [ this.toss(hands, hand) ];
      }


      this.expect("[");
      const release = [ this.toss(hands, hand) ];


      const separators = [",", " "];
      const separated = this.upcoming(separators);

      while( !this.upcoming("]") ){
         if( separated ){
            const separator = this.autoset("tossSeparator", separators, "Inconsistent use of toss separators");
            this.expect(separator);
         }
         release.push( this.toss(hands, hand) );
      }
  
      this.expect("]");

      if( release.length === 1 ){
         this.set("releaseBrackets", true, "Inconsistent use of release brackets.");
      }

      return release;

   }

   toss( hands, hand ){

      const value = parseInt(this.expect("value"));
      let handTo;

      if( !this.upcoming("hand") ){
         this.set("selfHand", true, "Same hand throws inconsistently denoted.");
         handTo = hand;
      }
      else{
         handTo = this.expect("hand");

         if( handTo === hand )
            this.set("selfHand", false, "Same hand throws inconsistently denoted.");
      }

      if( value === 0 )
         return new Toss(0, null, null);

      return new Toss(value, hands.indexOf(hand), hands.indexOf(handTo));

   }


}



let parser;

function parse( string, hands, legacy ){

   if( !parser )
      parser = new Parser();

   return parser.parse(string, hands, legacy);

}

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

}

function validateThrows( throws ){

	if( !Array.isArray(throws) || !throws.length )
		throw new Error("Invalid throw sequence.");

	for( const action of throws ){
		if( !Array.isArray(action) || action.length !== throws[0].length )
			throw new Error("Invalid throw sequence.");

		if( action.some(release => !Array.isArray(release) || !release.every(toss => toss instanceof Toss)) )
			throw new Error("Invalid throw sequence.");
	}

}

function mirrorThrows( throws ){

   for( let i = 0, n = throws.length; i < n; i++ )
      throws.push( throws[i].map( release => release.map(toss => new Toss(toss.value, 1 - toss.handFrom, 1 - toss.handTo)) ).reverse() );

}

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

// A juggle is either a siteswap or a transition between states. It 
// validates the throw and hand sequences' structure. If legacy mode,
// it assigns default hands and mirrors the throw sequence (after
// structure validation).

// Transitions don't do much at the moment (they only appear in
// `.composition`), their existence will be justified once the
// graph and generation come to life. They are also expected to
// be used for connecting siteswaps (going from one to another).

class Juggle {
   
   constructor( input, legacy ){

      this.input = input;

      try{

         let siteswap;
         let hands;
         let mirrored = false;

         // Input is string: separate hands from siteswap.
         if( typeof input === "string" ){
            [ siteswap, hands ] = input.split(":").reverse();
            if( hands )
               hands = hands.replace(" ", "").split(",");
         }
         // Input is object: hands and siteswap are separated.
         else if( typeof input === "object" && input.siteswap ){
            [ siteswap, hands ] = [ input.siteswap, input.hands ];
         }
         else{
            throw new Error("Invalid input.");
         }


         // Legacy adjustments slightly complicate things.
         if( legacy ){

            if( !hands ){
               if( typeof siteswap === "string" ) 
                  hands = siteswap.includes("(") ? ["l", "r"] : ["l"];
               else
                  hands = siteswap[0].length === 2 ? ["l", "r"] : ["l"];
            }

            if( hands.length > 2 ){
               throw new Error("Legacy mode supports at most two hands.");
            }

            const mirror = /\* *$/;
            if( typeof siteswap === "string" && mirror.test(siteswap) ){
               siteswap = siteswap.replace(mirror, "");
               mirrored = true;
            }

         }

         // Parse and validate throws and hands.
         this.validateHands(hands);

         const throws = typeof siteswap === "string" ? this.parse(siteswap, hands, legacy) : siteswap;

         this.validateThrows(throws);

         // Mirror throws after they're parsed, if needed.
         if( mirrored )
            this.mirrorThrows(throws);


         const values = throws.reduce((result, action) => Array.prototype.concat.apply(result, action.map(release => release.map(toss => toss.value))), []);
         
         // Assign properties.
         this.hands         = hands;
         this.throws        = throws;
         this.valid         = true;
         this.degree        = hands.length;
         this.props         = values.reduce((sum, value) => sum + value, 0) / this.throws.length;
         this.multiplex     = throws.reduce( (max, action) => Math.max.apply(null, [max, ...action.map(release => release.length)]), 0 );
         this.greatestValue = Math.max.apply(null, values);
         this.string        = this.stringify(this.throws, this.hands);

      }
      catch(e){

         this.valid = false;
         this.message = e.message;

      }

   }

}

Juggle.prototype.parse = parse;
Juggle.prototype.validateHands = validateHands;
Juggle.prototype.validateThrows = validateThrows;
Juggle.prototype.mirrorThrows = mirrorThrows;
Juggle.prototype.stringify = stringify;

// Validates the siteswap for collisions. Assumes that throws sequence structure is valid.

function validate( throws ){

	const balance = throws.map( action => action.map(release => 0) );

	for( let beat = 0; beat < throws.length; beat++ ){

		const action = throws[beat];
		for( const release of action ){
			for( const toss of release ){
				// Outgoing toss counts.
				balance[beat][toss.handFrom]++;

				// Incoming toss counts.
				balance[(beat + toss.value) % throws.length][toss.handTo]--;
			}
		}
	}

	if( balance.some(action => action.some(count => count !== 0)) )
		throw new Error("Invalid siteswap.");

}

function equalThrowSequence( throws1, throws2 ){

   if( throws1.length !== throws2.length )
      return false;

   for( let i = 0; i < throws1.length; i++ ){
      const action1 = throws1[i];
      const action2 = throws2[i];
      if( action1.length !== action2.length )
         return false;

      for( let j = 0; j < action1.length; j++ ){
         const release1 = action1[j];
         const release2 = action2[j];
         if( release1.length !== release2.length )
            return false;

         for( let k = 0; k < release1.length; k++ ){
            const toss1 = release1[k];
            const toss2 = release2[k];
            if( toss1.value !== toss2.value || toss1.handFrom !== toss2.handFrom || toss1.handTo !== toss2.handTo )
               return false;
         }
      }
   }

   return true;

}

function truncate( throws ){

   for( let i = 1, n = Math.floor(throws.length / 2); i <= n; i++ ){

      if( throws.length % i === 0 ){
         const sample1 = throws.slice(0, i);
         for( let j = i; j < throws.length; j += i ){
            const sample2 = throws.slice(j, j + i);

            if( !equalThrowSequence(sample1, sample2) ){
               break;
            }
            if( i + j === throws.length ){
               throws.length = i;
               return throws;
            }
         }
      }
   }

}

function advance( action ){

   const schedule = [];
   if( this.strict ){
      schedule.push( ...this.schedule.map(handState => [...handState.slice(1).map(balls => balls.slice()), []]) );
   }
   else{
      schedule.push( ...this.schedule.map(handState => [...handState.slice(1), 0]) );
   }

   for( const release of action ){
      for( let i = 0; i < release.length; i++ ){
         const toss = release[i];
         if( toss.value > 0 ){
            if( this.strict ){
               const ball = this.schedule[toss.handFrom][0][i];
               schedule[toss.handTo][toss.value - 1].push(ball);
            }
            else{
               schedule[toss.handTo][toss.value - 1]++;
            }
         }
      }
   }

   return new State(schedule, this.strict);

}

function equals( state ){

   if( this.strict !== state.strict )
      return false;

   const s1 = this.schedule;
   const s2 = state.schedule;
   
   if( s1.length !== s2.length )
      return false;

   for( let hand = 0; hand < s1.length; hand++ ){
      if( s1[hand].length !== s2[hand].length )
         return false;

      for( let beat = 0; beat < s1[hand].length; beat++ ){

         if( this.strict ){
            if( s1[hand][beat].length !== s2[hand][beat].length )
               return false;

            for( let ball = 0; ball < s1[hand][beat].length; ball++ )
               if( s1[hand][beat][ball] !== s2[hand][beat][ball] )
                  return false;
         }
         else{
            if( s1[hand][beat] !== s2[hand][beat] )
               return false;
         }

      }
   }

   return true;

}

function isExcited(){

   const schedule = this.schedule;

   let props;
   if( this.strict ){
      props = this.schedule.reduce( (sum, handState) => sum + handState.reduce((sum, beatState) => sum + beatState.length, 0), 0 );
   }
   else{
      props = this.schedule.reduce( (sum, handState) => sum + handState.reduce((sum, beatState) => sum + beatState, 0), 0 );
   }

   const hands = this.schedule.length;
   const greatestValue = this.schedule[0].length;
   const saturated = Math.floor(props / hands);
   let excess = props % hands;

   if( !this.strict ){
      for( let i = 0; i < hands; i++ ){
         for( let j = 0; j < saturated; j++ )
            if( this.schedule[i][j] !== 1 )
               return true;

         const filled = this.schedule[i][saturated] === 1 ? 1 : 0;
         for( let j = saturated + filled; j < greatestValue; j++ )
            if( this.schedule[i][j] !== 0 )
               return true;
         excess -= filled;
      }
   }

   else{
      for( let i = 0; i < hands; i++ ){
         for( let j = 0; j < saturated; j++ )
            if( this.schedule[i][j].length !== 1 )
               return true;

         if( saturated === greatestValue )
            continue;

         const filled = this.schedule[i][saturated].length === 1 ? 1 : 0;
         for( let j = saturated + filled; j < greatestValue; j++ )
            if( this.schedule[i][j].length !== 0 )
               return true;
         excess -= filled;
      }
   }

   return excess !== 0;

}

// I'm not satisfied with the state of `State`, but being a temporary solution
// until the graph content (which will use `State`, `Transition` and `Siteswap`) 
// is introduced, it can keep on keeping on.

// `strict`ness should be removed from state if it's not used at all by the graph,
// and the `.strictStates` of a siteswap should be derived from the normal states.


class State {

   constructor( source, strict = false ){

      let schedule;

      // Find initial state of a given siteswap.
      if( source instanceof Array ){

         schedule = source;      

      }
      else if( source instanceof Siteswap ){

         schedule = [];

         const siteswap = source;
         for( let i = 0; i < siteswap.degree; i++ ){
            const handState = [];
            for( let j = 0; j < siteswap.greatestValue; j++ )
               handState.push( strict ? [] : 0 );
            schedule.push(handState);
         }

         let balls = 0;
         for( let beat = -1; balls < siteswap.props; beat-- ){

            const action = siteswap.throws[((beat % siteswap.throws.length) + siteswap.throws.length) % siteswap.throws.length];
            for( const release of action ){
               for( const toss of release ){
                  if( beat + toss.value >= 0 ){
                     if( strict )
                        schedule[toss.handTo][beat + toss.value].push(balls);
                     else
                        schedule[toss.handTo][beat + toss.value]++;
                     balls++;
                  }
               }
            }
         }

      }
      else{
         throw new Error("Invalid input.")
      }

      this.schedule = schedule;
      this.strict = strict;
      this.ground = !this.isExcited();

   }

}

State.prototype.advance = advance;
State.prototype.equals = equals;
State.prototype.isExcited = isExcited;

function schedulise( throws, strict ){

	const states = [ new State(this, strict) ];

	do {
		for( const action of throws )
			states.push( states[states.length - 1].advance(action) );
	} while( !states[0].equals(states[states.length - 1]) );

	states.pop();

	return states;

}

function mark( orbit, map, throws, i, j ){

	const release = throws[i][j];
	for( const toss of release ){

		if( toss.value === 0 )
			continue;

		const beat = (i + toss.value) % throws.length;
		if( map[beat][toss.handTo] === orbit )
			continue;

		map[beat][toss.handTo] = orbit;
		mark( orbit, map, throws, beat, toss.handTo );
	}

}


function orbitise( throws, hands ){

	const orbits = [];

	// Maps tosses to orbits.
	const map = throws.map( action => action.map(release => null) );
	for( let i = 0; i < throws.length; i++ ){
		const action = throws[i];
		for( let j = 0; j < action.length; j++ ){

			const release = action[j];
			if( map[i][j] === null && !(release.length === 1 && release[0].value === 0) ){
				const orbit = [];
				mark( orbit, map, throws, i, j );
				orbits.push(orbit);
			}
		}
	}

	if( orbits.length === 1 )
		return [this];

	for( let i = 0; i < throws.length; i++ ){
		const action = throws[i];
		for( const orbit of orbits )
			orbit.push( action.map( (release, j) => map[i][j] === orbit ? release : [new Toss(0, null, null)] ) );
	}

	return orbits.map( orbit => new Siteswap({ hands, siteswap: orbit }) );

}

class Transition extends Juggle {

	constructor( input, stateFrom, stateTo, legacy = true ){

	  super(input, legacy);

	  if( !this.valid )
	     return this;

	  this.stateFrom = stateFrom;
	  this.stateTo = stateTo;

	}

}

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

function excitify(){
   
   return this.states.some( state => state.ground );

}

function log(){

   if( !this.valid ){
      console.log("Invalid siteswap.");
      return;
   }


   const lines = [];

   lines.push("siteswap\n " + this.string);
   lines.push("props\n " + this.props);
   lines.push("period\n " + this.period);
   lines.push("hands\n " + this.degree);
   lines.push("multiplex\n " + this.multiplex);
   lines.push("full period\n " + this.fullPeriod);
   lines.push("prime\n " + this.prime);
   lines.push("ground state\n " + this.groundState);
   
   lines.push("throw sequence");
   this.throws.forEach( (action, i) => action.forEach((release, j) => lines.push(" " + (i + 1) + (this.degree === 1 ? "" : ", hand " + this.hands[(i + j) % this.degree]) + ": [" + release.map( toss => toss.value + (toss.value === 0 || this.degree === 1 ? "" : this.hands[toss.handTo]) ).join(",") + "]")) );

   lines.push("states");
   this.states.forEach( (state, i) => state.schedule.forEach((handState, j) => lines.push(" " + (i + 1) + (this.degree === 1 ? "" : ", hand " + this.hands[j]) + ": [" + handState.join(",") + "]")) );

   lines.push("strict states");
   this.strictStates.forEach( (state, i) => state.schedule.forEach((handState, j) => lines.push(" " + (i + 1) + (this.degree === 1 ? "" : ", hand " + this.hands[j]) + ": [" + handState.map(balls => "[" + (!balls.length ? "-" : balls.join(",")) + "]").join(",") + "]" )) );

   lines.push("orbits");
   this.orbits.forEach( (orbit, i) => lines.push(" " + (i + 1) + ": " + orbit.string) );

   lines.push("composition");
   this.composition.forEach( (prime, i) => lines.push( (prime instanceof Siteswap ? " siteswap: " : " transition: ") + prime.string) );

   lines.push(" ");

   console.log( lines.join("\n") );

}

class Siteswap extends Juggle {
   
   constructor( input, legacy = true ){

      super(input, legacy);

      if( !this.valid )
         return this;

      try{

         this.validate(this.throws, this.hands);
         this.valid = true;

      }
      catch(e){

         // Unset properties set in `Juggle`.
         const keys = Object.keys(this).filter(key => key !== "input");
         for( const key of keys )
            delete this[key];

         this.valid = false;
         this.message = e.message;
         return this;
         
      }


      // Truncate throw sequence repetitions before anything else.
      this.truncate(this.throws);


      // Set in `Juggle`:
      //  this.hands
      //  this.throws
      //  this.degree
      //  this.props
      //  this.greatestValue
      //  this.multiplex
      //  this.string

      this.states        = this.greatestValue === 0 ? [] : this.schedulise( this.throws, false );
      this.strictStates  = this.greatestValue === 0 ? [] : this.schedulise( this.throws, true );
      this.orbits        = this.orbitise(this.throws, this.hands);
      this.composition   = this.decompose(this.states, this.throws, this.hands);
      
      this.period        = this.states.length;
      this.fullPeriod    = this.strictStates.length;
      this.prime         = this.composition.length === 1;

      this.groundState   = this.excitify();

   }

}

Siteswap.prototype.validate     = validate;
Siteswap.prototype.truncate     = truncate;
Siteswap.prototype.schedulise   = schedulise;
Siteswap.prototype.excitify     = excitify;
Siteswap.prototype.orbitise     = orbitise;
Siteswap.prototype.decompose    = decompose;
Siteswap.prototype.log          = log;

module.exports = Siteswap;

return module.exports;});
