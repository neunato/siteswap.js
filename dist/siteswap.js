(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Siteswap = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

function validate( throws ){

   // This error assumes notations can't yield invalid .throws, only user can.
   if( !validStructure(throws) )
      throw new Error("Invalid input.");

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

function validStructure( throws ){
   
   if( !Array.isArray(throws) || !throws.length )
      return false;

   for( const action of throws ){
      if( !Array.isArray(action) || action.length !== throws[0].length )
         return false;

      if( action.some(release => !Array.isArray(release) || !release.every(({ value, handFrom, handTo }) => value !== undefined && handFrom !== undefined && handTo !== undefined && handFrom < action.length && handTo < action.length)) )
         return false;
   }

   return true;

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

   return throws;

}

// All nodes (states) are stored in the same Map, regardless of number of props, degree, and length. All siteswaps  
// refer to the same `.schedule` arrays, stored on nodes.

// A state is accessed by providing the schedule. If the schedule already maps to a state, return that. If not, 
// check if the string representation of the schedule maps to a state, and return that. If neither works, store a 
// new `State` under the provided schedule and its string, and return it.

// A state can be accessed by providing a siteswap, whose initial state will be returned (and generated if it does 
// not exist).

// Nodes are currently only used to reuse their .schedules, but they are ready for links (transitions) and graph 
// traversals.

// Not sure how efficient all these lookups will be on large graphs.


const states = {
   schedules: new Map(),    // Schedule array to node map.
   strings: new Map()       // Schedule string to node map.
};

class State {
   
   constructor( schedule ){

      if( !Array.isArray(schedule) || !schedule.every(Array.isArray) )
         throw new Error("Invalid input.")

      // Schedule already used.
      let state = states.schedules.get(schedule);
      if( state )
         return state
      
      // Schedule not used, see if it's equivalent already found.
      const string = schedule.map(row => row.join(',')).join('-');
      state = states.strings.get(string);
      if( state )
         return state

      // New state.
      states.schedules.set(schedule, this);
      states.strings.set(string, this);

      this.schedule = schedule;

   }

   advance( action ){

      const next = this.schedule.map(array => array.slice(1));

      for( let i = 0; i < action.length; i++ ){

         const release = action[i];

         // Check if toss distribution matches the beat's state.
         if( release.filter(({ value }) => value).length !== (this.schedule[i][0] || 0) )
            throw new Error("dead")

         if( !release.length )
            continue

         for( const { value, handTo, handFrom } of release ){
            if( value <= 0 )
               continue

            next[handTo][value - 1] = (next[handTo][value - 1] || 0) + 1;

            for( let h = 0; h < next.length; h++ ){
               for( let k = this.schedule[0].length - 1; k < value; k++ )
                  if( !next[h][k] )
                     next[h][k] = 0;
            }

         }
      }

      return new State(next)

   }

}


function getInitialState( siteswap ){

   const schedule = [];
   for( let i = 0; i < siteswap.degree; i++ )
      schedule.push( Array(siteswap.greatestValue).fill(0) );

   if( siteswap.greatestValue === 0 )
      return new State( schedule )

   const throws = siteswap.throws;

   // The initial state is found by moving backwards in time and filling in
   // the balls until all are found.
   let props = 0;

   for( let i = -1; true; i-- ){
      const action = throws[((i % throws.length) + throws.length) % throws.length];
      for( const release of action ){
         for( const toss of release ){
            const at = i + toss.value;
            if( at < 0 )
               continue

            schedule[toss.handTo][at]++;
            props++;

            if( props === siteswap.props ){
               let length = siteswap.greatestValue;
               while( schedule.every(row => row[length - 1] === 0) )
                  length--;

               for( let j = 0; j < siteswap.degree; j++ )
                  schedule[j].length = length;

               return new State( schedule )
            }
         }
      }
   }

}

function schedulise( siteswap ){

   const states = [];
   const first = getInitialState(siteswap);
   let last = first;
   do {
      for( const action of siteswap.throws ){
         states.push( last.schedule );
         last = last.advance(action);
      }
   } while( first !== last );

   return states;

}

// Strict states are derived from "normal" states (defined in `src/graph.js`), and implement their own 
// `.advance()` and `.equals()` functions.

function scheduliseStrictly( siteswap ){

   const schedules = [];
   const first = strictify(siteswap.states[0]);
   let last = first;
   do {
      for( const action of siteswap.throws ){
         schedules.push( last );
         last = advance(last, action);
      }
   } while( !equal(first, last) );

   return schedules;

}

function strictify( schedule ){

   let ball = 0;
   return schedule.map( s => s.map(c => Array(c).fill().map(() => ++ball)) )

}

function advance( schedule, action ){
  
   const next = schedule.map(state => state.slice(1).map(balls => [...balls]));

   for( let i = 0; i < action.length; i++ ){
      const release = action[i];

      // The only way to advance from an "empty" 0-state is by throwing 0s. We don't validate structure (state to
      // toss distribution match) here because it's done in `src/graph.js` for `.states`.
      if( !release.length && release.every(({value, handTo, handFrom}) => value === 0 && handTo === i && handFrom === i) )
         continue;

      for( let j = 0; j < release.length; j++ ){
         const toss = release[j];

         if( toss.value <= 0 )
            continue;

         const ball = schedule[toss.handFrom][0][j];

         for( let h = 0; h < next.length; h++ ){
            for( let k = schedule[0].length - 1; k < toss.value; k++ )
               if( !next[h][k] )
                  next[h][k] = [];
         }

         next[toss.handTo][toss.value - 1].push(ball);

      }

   }

   return next;

}

function equal( schedule1, schedule2 ){
   
   if( schedule1.length !== schedule2.length )
      return false;

   for( let i = 0; i < schedule1.length; i++ ){
      const subschedule1 = schedule1[i];
      const subschedule2 = schedule2[i];

      if( subschedule1.length !== subschedule2.length )
         return false;

      for( let j = 0; j < subschedule1.length; j++ ){
         const balls1 = subschedule1[j];
         const balls2 = subschedule2[j];

         if( balls1.length !== balls2.length )
            return false;

         for( let k = 0; k < balls1.length; k++ ){
            if( balls1[k] !== balls2[k] )
               return false;
         }
      }
   }

   return true;

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

function orbitise( siteswap ){

   const { throws, notation } = siteswap;
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
		return [siteswap];

	for( let i = 0; i < throws.length; i++ ){
		const action = throws[i];
		for( const orbit of orbits )
			orbit.push( action.map( (release, j) => map[i][j] === orbit ? release : [{ value: 0, handFrom: j, handTo: j }] ) );
	}

	return orbits.map( orbit => new Siteswap(orbit, notation) );

}

function decompose( siteswap ){

   const composition = [];

   const throws = [...siteswap.throws];
   const states = [...siteswap.states];
   const notation = siteswap.notation;

   let last = 0;
	for( let to = 1; to <= states.length; to++ ){
		for( let from = to - 1; from >= last; from-- ){
			if( states[to % states.length] !== states[from] ){
            continue;
         }

         // Prime siteswap.
			if( from === 0 && to === states.length ){
            if( !composition.length )
               return [siteswap];
            add(composition, new Siteswap(throws.slice(from, to), notation));
            return composition;
			}

         // Composite siteswaps, no transition.
         if( last === from ){
            add(composition, new Siteswap(throws.slice(from, to), notation));
            last = to;
         }
         else{
            // Composite siteswaps with transition.
            add(composition, new Siteswap(throws.splice(from, to - from), notation));
            states.splice(from, to - from);
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

const offset = "A".charCodeAt(0);
const count = "Z".charCodeAt(0) - offset + 1;


// Convert integer to an A-Z string (0 => A, 25 => Z, 26 => AA).

function alphabetic( int ){

  return "A".repeat(Math.floor(int / count)) + String.fromCharCode(offset + int % count)

}


// Convert A-Z string to an integer (A => 0, Z => 25, AA => 26).

function numeric( string ){

   let i = 0;
   while( string[i] === "A" )
      i++;

   if( i < string.length - 1 )
      throw new Error("Invalid input.")

   if( i === string.length )
      return (i - 1) * count

   return i * count + string[i].charCodeAt(0) - offset

}

let whitespace = true;


const macros = {

   // Allow whitespace.
   ws(){

      return { allow: " " }

   },

   // Trim whitespace.
   trim( rule ){

      const ws = macros.ws();
      return { symbols: [ws, rule, ws], processor: ([,result]) => result }

   },

   // Fixed value comma (possibly surrounded by whitespace) or whitespace.
   separator(){

      if( whitespace ){
         const ws = macros.ws();
         return { either: [{ symbols: [ws, ",", ws] }, " "], fixed: true }
      }
      else{
         return { either: [",", " "], fixed: true }
      }

   },

   // Rule repeated `min` or more times (possibly separated).
   separated( sep, min, rule ){

      return {
         symbols: [rule, { repeat: [sep, rule], min: min - 1, max: Infinity }],
         processor: ([first,[...rest]]) => [first, ...rest.map(second)]
      }

   },

   // One `toss` without brackets or many separated inside brackets (with all the possible whitespace).
   release( toss, sep ){

      const tosses = macros.separated(sep, 2, toss);
      return {
         either: [
            { symbols: [toss] },
            { symbols: ["[", whitespace ? macros.trim(tosses) : tosses, "]"], processor: ([,result]) => result }
         ]
      }

   },

   asyncSiteswap( toss, sep ){

      const ws = macros.ws();
      return {
         symbol: macros.separated(sep, 1, macros.release(toss, sep)),
         processor: (releases) => releases.map(release => [release])
      }

   },

   syncSiteswap( toss, sep1, sep2 ){

      const ws = macros.ws();
      const release = macros.release(toss, sep1);


      if( whitespace ){
         const action = { symbols: ["(", ws, release, sep2, release, ws, ")"], processor: ([, , release1, , release2]) => [release1, release2] };
         return {
            symbols: [macros.separated(ws, 1, action), ws, { allow: "*" }],
            processor: ([throws, ,mirror]) => mirror ? mirrorSync(throws) : throws
         }
      }
      else{
         const action = { symbols: ["(", release, sep2, release, ")"], processor: ([, release1, , release2]) => [release1, release2] };
         return {
            symbols: [macros.separated(null, 1, action), { allow: "*" }],
            processor: ([throws, mirror]) => mirror ? mirrorSync(throws) : throws
         }
      }

   }

};

// Order matters.
const terminals = [
   { tokenType: "[", regex: "\\[" },
   { tokenType: "]", regex: "\\]" },
   { tokenType: "(", regex: "\\(" },
   { tokenType: ")", regex: "\\)" },
   { tokenType: "<", regex: "<" },
   { tokenType: ">", regex: ">" },
   { tokenType: "\n", regex: "\n" },
   { tokenType: "|", regex: "\\|" },
   { tokenType: "-", regex: "-" },
   { tokenType: ",", regex: "," },
   { tokenType: " ", regex: " +" },
   { tokenType: "*", regex: "\\*" },
   { tokenType: "x", regex: "x", processor: () => true },
   { tokenType: "pN", regex: "p(?:[1-9][0-9]*|0)", processor: match => toNumber(match.slice(1)) },
   { tokenType: "p", regex: "p", processor: () => true },
   { tokenType: "digit", regex: "[0-9]", processor: toNumber },
   { tokenType: "digit_even", regex: "[02468]", processor: toNumber },
   { tokenType: "letter", regex: "[a-zA-Z]", processor: numerify },
   { tokenType: "letter_even", regex: "[acegikmoqsuwyACEGIKMOQSUWY]", processor: numerify },
   { tokenType: "letter_capital", regex: "[A-Z]" },
   { tokenType: "integer", regex: "[1-9][0-9]*|[0-9]", processor: toNumber },
   { tokenType: "integer_even", regex: "[1-9][0-9]*[02468]|[02468]", processor: toNumber }
];

const rules = {

   "standard_async": function(){
      whitespace = true;
      return {
         symbol: macros.trim(macros.asyncSiteswap("integer", macros.separator())),
         processor: finaliseAsync
      }
   },

   "compressed_async": function(){
      whitespace = false;
      return {
         symbol: macros.trim(macros.asyncSiteswap({ either: ["digit", "letter"] }, null)),
         processor: finaliseAsync
      }
   },

   "standard_sync": function(){
      whitespace = true;
      const sep = macros.separator();
      const toss = {
         symbols: ["integer_even", { allow: "x" }],
         processor: ([value, cross]) => ({ value, cross: !!cross })
      };
      return {
         symbol: macros.trim(macros.syncSiteswap(toss, sep, sep)),
         processor: finaliseSync
      }
   },

   "compressed_sync": function(){
      whitespace = false;
      const sep = { allow: macros.separator(), fixed: true };
      const toss = {
         symbols: [{ either: ["digit_even", "letter_even"] }, { allow: "x" }],
         processor: ([value, cross]) => ({ value, cross: !!cross })
      };
      return {
         symbol: macros.trim(macros.syncSiteswap(toss, null, sep)),
         processor: finaliseSync
      }
   },

   "multihand": function(){
      whitespace = true;

      const ws = macros.ws();

      const tossAlpha = {
         symbols: ["letter_capital", "integer"],
         processor: ([hand, value]) => ({ value, hand: numeric(hand) })
      };
      const tossNum = {
         symbols: ["(", ws, { allow: "-" }, "integer", ws, ",", ws, "integer", ws, ")"],
         processor: ([, , minus, hand, , , , value]) => ({ value, offset: minus ? -hand : hand })
      };

      const sep1 = macros.trim(",");
      const sep2 = macros.trim("\n");

      return {
         symbol: macros.trim({
            either: [
               macros.separated(sep2, 1, macros.separated(sep1, 1, macros.release(tossAlpha, sep1))),
               macros.separated(sep2, 1, macros.separated(ws, 1, macros.release(tossNum, ws)))
            ]
         }),
         processor: finaliseMultihand
      }
   },

   "passing_async": function(){
      whitespace = true;

      const ws = macros.ws();

      const siteswap1 = macros.trim(macros.asyncSiteswap({ symbols: ["integer", { allow: "p" }], processor: ([value, pass]) => ({ value, pass }) }, macros.separator()));
      const siteswap2 = macros.trim(macros.asyncSiteswap({ symbols: ["integer", { allow: "pN" }], processor: ([value, pass]) => ({ value, pass }) }, macros.separator()));

      return {
         symbol: macros.trim({
            either: [
               { symbols: ["<", siteswap1, "|", siteswap1, ">"], processor: ([, siteswap1, , siteswap2]) => [siteswap1, siteswap2] },
               { symbols: ["<", macros.separated("|", 2, siteswap2), ">"], processor: ([, siteswaps]) => siteswaps }
            ]
         }),
         processor: finalisePassingAsync
      }
   },
   
   "passing_sync": function(){
      whitespace = true;

      const ws = macros.ws();

      const sep1 = macros.separator();
      const sep2 = macros.separator();
      const sep3 = macros.separator();
      const sep4 = macros.separator();

      const siteswap1 = macros.trim({
         either: [
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "x" }, { allow: "p" }], processor: ([value, cross, pass]) => ({ value, pass, cross }) }, sep1, sep1),
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "p" }, { allow: "x" }], processor: ([value, pass, cross]) => ({ value, pass, cross }) }, sep2, sep2)
         ]
      });
      const siteswap2 = macros.trim({
         either: [
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "x" }, { allow: "pN" }], processor: ([value, cross, pass]) => ({ value, pass, cross }) }, sep3, sep3),
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "pN" }, { allow: "x" }], processor: ([value, pass, cross]) => ({ value, pass, cross }) }, sep4, sep4)
         ]
      });

      return {
         symbol: macros.trim({
            either: [
               { symbols: ["<", siteswap1, "|", siteswap1, ">"], processor: ([, siteswap1, , siteswap2]) => [siteswap1, siteswap2] },
               { symbols: ["<", macros.separated("|", 2, siteswap2), ">"], processor: ([, siteswaps]) => siteswaps }
            ]
         }),
         processor: finalisePassingSync
      }
   }

};


for( let i = 0; i < terminals.length; i++ ){
   const terminal = terminals[i];
   terminal.index = i;
   rules[terminal.tokenType] = terminal;
}

function second([ ,a ]){
   return a
}

function toNumber( n ){
   return Number(n)
}

function numerify( letter ){
   if( letter < "a" )
      return letter.charCodeAt(0) - "A".charCodeAt(0) + 36
   else
      return letter.charCodeAt(0) - "a".charCodeAt(0) + 10
}

function lcm( a, b ){
   const greater = Math.max(a, b);
   const smaller = Math.min(a, b);
   let result = greater;
   while( result % smaller !== 0 )
      result += greater;
   return result;
}





function mirrorSync( throws ){

   // Same tosses reused here (finalise functions create new objects anyway)
   return throws.concat( throws.map(action => action.map(release => [...release]).reverse()) )

}

// Standard and compressed async.
function finaliseAsync( throws ){

   for( const action of throws )
      for( const release of action )
         for( let i = 0; i < release.length; i++ )
            release[i] = { value: release[i], handFrom: 0, handTo: 0 };
   return throws

}

// Standard and compressed sync.
function finaliseSync( throws ){

   for( const action of throws ){
      for( let i = 0; i < action.length; i++ ){
         const release = action[i];
         for( let j = 0; j < release.length; j++ ){
            const { value, cross } = release[j];
            release[j] = { value: value / 2, handFrom: i, handTo: cross ? 1 - i : i };
         }
      }
   }   

   return throws

}

function finaliseMultihand( rows ){

   const period = rows.map(({length}) => length).reduce(lcm);
   const throws = [];
   for( let i = 0; i < period; i++ ){
      const action = rows.map(row => row[i % row.length]).map(function(release, handFrom){
         return release.map(function({ value, hand, offset }){
            const handTo = offset !== undefined ? handFrom + offset : hand;
            return { value, handFrom, handTo }
         })
      });
      throws.push( action );
   }
   return throws

}

function finalisePassingAsync( siteswaps ){

   const period = siteswaps.map(({length}) => length).reduce(lcm);
   const throws = [];
   for( let i = 0; i < period; i++ ){
      const action = siteswaps.map(actions => actions[i % actions.length][0]).map(function(release, handFrom){
         return release.map(function({ value, pass }){
            if( pass === true )
               pass = 2 - handFrom;
            const handTo = pass === null ? handFrom : (pass - 1);
            return { value, handFrom, handTo }
         })
      });
      throws.push( action );
   }
   return throws

}

function finalisePassingSync( siteswaps ){

   const period = siteswaps.map(({length}) => length).reduce(lcm);
   const throws = [];
   for( let i = 0; i < period; i++ ){
      const action = Array.prototype.concat( ...siteswaps.map(siteswap => siteswap[i % siteswap.length]) ).map(function(release, handFrom){
         return release.map(function({ value, pass, cross }){
            if( pass === true )
               pass = 2 - Math.floor(handFrom / 2);

            const handTo = (pass === null ? handFrom : ((pass - 1) * 2 + handFrom % 2)) + (cross ? (handFrom % 2 ? -1 : 1) : 0);
          //  const handTo = (pass ? ((pass - 1) * 2 + handFrom % 2) : handFrom) + (cross ? (handFrom % 2 ? -1 : 1) : 0);


            return { value: value / 2, handFrom, handTo }
         })
      });
      throws.push( action );
   }
   return throws

}

const error = { ERROR: true };            // Used as a Symbol, could be expanded with error details.

let tokens;
let tokenAt = 0;




// Notation (root) rules keep references to reachable terminals and reachable `fixed` rules, whose token value or 
// parsed branch doesn't change within a single parsing attempt.

function serialise( rule, root = null ){

   if( root === null ){

      const root = {};
      root.immutables = [];
      root.terminals = new Set();

      rule = serialise(rule, root);
      rule.immutables = root.immutables;
      rule.terminals = [...root.terminals];

      return rule
   }


   // Optional branch.
   if( rule === null ){
      return rule
   }

   // Strings refer to named rules.
   if( typeof rule === "string" ){
      if( !rules[rule] )
         throw new Error("Impossible.")
      return serialise(rules[rule], root)
   }

   // An array represents a sequence of symbols.
   if( Array.isArray(rule) ){
      return { symbols: rule.map(symbol => serialise(symbol, root)) }
   }

   // Immutable value/branch.
   if( rule.fixed ){
      root.immutables.push(rule);
   }

   // Terminal token.
   if( rule.tokenType ){
      root.terminals.add(rule);
      return rule
   }

   // Has to be an instruction object.
   if( typeof rule !== "object" ){
      throw new Error("Impossible.")
   }



   if( rule.symbol ){
      rule.symbol = serialise(rule.symbol, root);
   }
   else if( rule.symbols ){
      rule.symbols = rule.symbols.map(symbol => serialise(symbol, root));
   }
   else if( rule.repeat ){
      rule.repeat = rule.repeat.map(symbol => serialise(symbol, root));
   }
   else if( rule.either ){
      rule.either = rule.either.map(symbol => serialise(symbol, root));
   }
   else if( rule.allow ){
      rule.either = [serialise(rule.allow, root), null];
      delete rule.allow;
   }
   else {
      throw new Error("Impossible.")
   }

   return rule

}


// Parse a string to tokens based on a rule.

function tokenise( terminals, string ){
   
  // const terminals = rule.terminals
  const regex = new RegExp(terminals.sort((a, b) => a.index - b.index).map(({ regex }) => `(${regex})`).join("|"), "y");

  // const regex = new RegExp(tokenTypes.map(({ regex }) => `(${regex})`).join("|"), "y")
   const tokens = [];
   while( regex.lastIndex < string.length ){
      const matches = regex.exec(string);
      if( matches === null )
         return null
      const index = matches.findIndex((type, i) => i && type);
      tokens.push({ type: terminals[index - 1].tokenType, value: matches[index] });
   }
   return tokens

}

function parseRule( rule ){

   let result;

   // Used for optional rules.
   if( rule === null ){
      return null
   }

   // Terminal symbol.
   if( rule.tokenType ){
      const token = tokens[tokenAt];
      if( !token || token.type !== rule.tokenType )
         return error

      if( rule.fixed ){
         if( !rule.value )
            rule.value = token.value;
         else if( token.value !== rule.value )
            return error
      }

      result = token.value;
      tokenAt++;
   }

   // List of symbols.
   else if( rule.symbol ){
      result = parseRule(rule.symbol);
      if( result === error )
         return error
   }

   // List of symbols.
   else if( rule.symbols ){
      result = [];
      for( const symbol of rule.symbols ){
         const parsed = parseRule(symbol);
         if( parsed === error )
            return error
         result.push(parsed);
      }
   }

   // List of symbols to repeat.
   else if( rule.repeat ){
      result = [];
      while( result.length < rule.max ){
         const at = tokenAt;
         const parsed = parseRule({ symbols: rule.repeat });
         if( parsed === error ){
            tokenAt = at;
            break
         }
         result.push(parsed);
      }

      if( result.length < rule.min || result.length > rule.max ){
         return error
      }
   }

   // List of possible parsing branches; return the first that parses successfully.
   else if( rule.either ){

      for( const branch of rule.either ){
         const at = tokenAt;
         const parsed = parseRule(branch);
         if( parsed === error ){
            tokenAt = at;
            continue
         }

         const processor = rule.processor;

         if( rule.fixed ){
            if( rule.value === undefined )
               rule.value = branch;
            else if( branch !== rule.value )
               return error
         }

         return processor ? processor(parsed) : parsed
      }

      return error
   }

   return rule.processor ? rule.processor(result) : result

}


// Returns the throws array or null on fails.

function parse( notation, string ){

   // This one's not meant to be caught, or happen.
   if( !notation || !rules[notation] )
      throw new Error("Impossible.")


   // Not initialised yet.
   if( typeof rules[notation] === "function" ){
      rules[notation] = serialise(rules[notation]());
   }

   const rule = rules[notation];

   // Clear the state of previous run.
   for( const symbol of rule.immutables )
      delete symbol.value;


   tokenAt = 0;

   tokens = tokenise(rule.terminals, string);

   if( !tokens || !tokens.length )
      return null

   const result = parseRule(rule);
   if( result === error || tokenAt !== tokens.length )
      return null

   return result

}

const declaration = {

   limits: {
      degree: { min: 1, max: 1 }
   },
   hands: () => ["Hand"],
   parse: (string) => parse("standard_async", string),
   unparse: (throws) => throws.map( ([release]) => release.length === 1 ? release[0].value : `[${release.map(({ value }) => value).join(",")}]`).join(",")

};

function unparseToss({ value, handFrom, handTo }){
   
   return `${value * 2}${handFrom !== handTo ? "x" : ""}`;

}

const declaration$1 = {

   limits: {
      degree: { min: 2, max: 2 }
   },
   hands: () => ["Left", "Right"],
   parse: (string) => parse("standard_sync", string),
   unparse: (throws) => throws.map( action => "(" + action.map( release => release.length === 1 ? unparseToss(release[0]) : `[${release.map(unparseToss).join(",")}]` ) + ")"  ).join("")

};

const declaration$2 = {

   limits: {
      degree: { min: 1, max: 1 },
      greatestValue: { max: 61 }
   },
   hands: () => ["Hand"],
   parse: (string) => parse("compressed_async", string),
   unparse: (throws) => throws.map( ([release]) => release.length === 1 ? release[0].value : `[${release.map(({ value }) => value).join("")}]`).join("")

};

function unparseToss$1({ value, handFrom, handTo }){
   
   return `${value * 2}${handFrom !== handTo ? "x" : ""}`;

}

const declaration$3 = {

   limits: {
      degree: { min: 2, max: 2 },
      greatestValue: { max: 61 }
   },
   hands: () => ["Left", "Right"],
   parse: (string) => parse("compressed_sync", string),
   unparse: (throws) => throws.map( action => "(" + action.map( release => release.length === 1 ? unparseToss$1(release[0]) : `[${release.map(unparseToss$1).join("")}]` ) + ")"  ).join("")

};

const declaration$4 = {

   limits: {
      degree: { min: 2 }
   },
   hands: degree => Array(degree).fill().map((_, i) => `juggler ${i + 1}`),
   parse: (string) => parse("passing_async", string),
   unparse

};



function unparse( throws ){
   
   const count = throws[0].length;
   const strings = [];
   for( let i = 0; i < count; i++ )
      strings.push( throws.map( action => unparseRelease(action[i]) ).join(",") );
   return `<${strings.join("|")}>`;

}

function unparseRelease( release ){
   
   const string = release.map( ({value, handFrom, handTo}) => `${value}${handFrom !== handTo ? `p${handTo + 1}` : ""}`).join(",");
   return release.length === 1 ? string : `[${string}]`;

}

const declaration$5 = {

   limits: {
      degree: { min: 4, step: 2 }
   },
   hands: degree => Array(degree).fill().map((_, i) => `juggler ${Math.floor(i / 2) + 1}, hand ${i % 2 + 1}`),
   parse: (string) => parse("passing_sync", string),
   unparse: unparse$1

};



function unparse$1( throws ){

   const count = throws[0].length;
   const strings = [];
   for( let i = 0; i < count; i += 2 )
      strings.push( throws.map( action => `(${unparseRelease$1(action[i])},${unparseRelease$1(action[i + 1])})` ).join("") );
   return `<${strings.join("|")}>`;

}

function unparseRelease$1( release ){
   
   const string = release.map( ({value, handFrom, handTo}) => `${value * 2}${handFrom % 2 !== handTo % 2 ? "x" : ""}${handTo === handFrom || handTo === handFrom + (handFrom % 2 ? -1 : 1) ? "" : ("p" + (Math.floor(handTo / 2) + 1))}` ).join(",");
   if( release.length === 1 )
      return string;
   else
      return `[${string}]`;

}

const declaration$6 = {

   hands: (n) => Array(n).fill().map((_, i) => alphabetic(i)),
   parse: (string) => parse("multihand", string),
   unparse: unparse$2

};



function unparse$2( throws ){

   const count = throws[0].length;
   const rows = [];
   for( let i = 0; i < count; i++ ){
      const row = throws.map(action => unparseRelease$2(action[i])).join(",");
      rows.push(row);
   }
   return rows.join("\n");

}

function unparseRelease$2( release ){

   const string = release.map(({ value, handTo }) => `${alphabetic(handTo)}${value}`).join(",");
   return release.length === 1 ? string : `[${string}]`;

}

const notations = {

   "standard:async":   declaration,
   "standard:sync":    declaration$1,
   "standard":         ["standard:async", "standard:sync"],
   "compressed:async": declaration$2,
   "compressed:sync":  declaration$3,
   "compressed":       ["compressed:async", "compressed:sync"],
   "passing:async":    declaration$4,
   "passing:sync":     declaration$5,
   "passing":          ["passing:async", "passing:sync"],
   "multihand":        declaration$6

};

function parse$1( string, notations$$1 ){

   // Flatten composite notations ("standard" to "standard:async" and "standard:sync").
   notations$$1 = notations$$1.reduce( (r, n) => r.concat(Array.isArray(notations[n]) ? notations[n] : n), [] );

   // .throws can be passed directly as an array to avoid parsing siteswaps that derived 
   // from others by direct manipulation. In that case, the first notation of the list 
   // will be assigned and it can be null.
   if( typeof string === "object" ){
      const notation = notations$$1[0];
      if( (typeof notation !== "string" || !notations[notation]) && notation !== null )
         throw new Error("Unsupported notation.");
      return { notation, throws: string };
   }

   // Check if notations exists.
   if( notations$$1.some(notation => typeof notation !== "string" || !notations[notation]) )
      throw new Error("Unsupported notation.");

   // When passed a string, try parsing with wanted notations, returning the first 
   // successful result.
   for( const notation of notations$$1 ){
      const throws = notations[notation].parse(string);
      if( throws )
         return { notation, throws };
   }

   throw new Error("Invalid syntax.");

}

function isGround( schedule ){

   return schedule.every(handSchedule => handSchedule.every( (value, index, {length}) => value === 1 || (value === 0 && index === length - 1) ));

}

function equals( siteswap ){

   if( !this.valid )
      throw new Error("Invalid siteswap.");

   if( !(siteswap instanceof Siteswap) || !siteswap.valid )
      return false;

   const throws1 = this.throws;
   const throws2 = siteswap.throws;

   if( throws1.length !== throws2.length )
      return false;

   for( let i = 0; i < throws1.length; i++ )
      if( match(throws1, throws2, i) )
         return true;

   return false;

}

function match( throws1, throws2, offset ){

   for( let i = 0; i < throws1.length; i++ ){
      const o = (i + offset) % throws1.length;
      if( throws1[o].length !== throws2[i].length )
         return false;
      for( let j = 0; j < throws1[o].length; j++ ){
         if( throws1[o][j].length !== throws2[i][j].length )
            return false;
         for( let k = 0; k < throws1[o][j].length; k++ ){
            const toss1 = throws1[o][j][k];
            const toss2 = throws2[i][j][k];
            if( toss1.value !== toss2.value  ||  toss1.handFrom !== toss2.handFrom  ||  toss1.handTo !== toss2.handTo )
               return false;
         }
      }
   }

   return true;

}

function rotate( count = 1 ){

   const throws = this.throws;

   if( count < 0 )
      count = throws.length + count % throws.length;

   return new Siteswap( throws.map((_, i) => throws[(i + count) % throws.length]), this.notation );

}

function toString( notation = this.notation ){

   if( !this.valid )
      throw new Error("Invalid siteswap.");

   if( notation === null )
      return JSON.stringify(this.throws);

   if( !notations[notation] || Array.isArray(notations[notation]) )
      throw new Error("Unsupported notation.");

   // Check if they're compatible.
   if( this.notation !== notation ){
      const from = notations[this.notation].limits || {};
      const to   = notations[notation].limits || {};
      const properties = Object.keys(to);

      // Check if notations are compatible.
      if( properties.some(prop => to[prop] !== undefined && from[prop] !== undefined &&
                                 (to[prop].min !== undefined && from[prop].max !== undefined && to[prop].min > from[prop].max) ||
                                 (to[prop].max !== undefined && from[prop].min !== undefined && to[prop].max < from[prop].min)) )
         throw new Error("Incompatible notations.");

      // Check if calling siteswap exceeds some limit.
      if( properties.some(prop => (to[prop].max && this[prop] > to[prop].max) ||
                                  (to[prop].min && this[prop] < to[prop].min) ||
                                  (this[prop] % (to[prop].step || 1) !== 0)) )
         throw new Error("This siteswap can't be converted to the target notation.");
   }

   return notations[notation].unparse(this.throws);

}

function log(){

   if( !this.valid ){
      console.log("Invalid siteswap.");
      return;
   }

   const lines = [];
   let hands;

   lines.push(`siteswap\n ${this.toString().replace(/\n/g, "\n ")}`);
   lines.push(`notation\n ${this.notation}`);
   lines.push(`degree\n ${this.degree}`);
   lines.push(`props\n ${this.props}`);
   lines.push(`period\n ${this.period}`);
   lines.push(`full period\n ${this.fullPeriod}`);
   lines.push(`multiplex\n ${this.multiplex}`);
   lines.push(`prime\n ${this.prime}`);
   lines.push(`ground state\n ${this.groundState}`);



   if( this.degree > 2 ){
      hands = Array(this.degree).fill().map((_, i) => alphabetic(i));

      lines.push("hand labels");
      const oldLabels = notations[this.notation].hands(this.degree);
      const paddings = [];
      paddings.push( this.degree.toString().length + 1 );
      paddings.push( Math.max(...oldLabels.map(({length}) => length)) );
      paddings.push( Math.max(...hands.map(({length}) => length)) );
      for( let i = 0; i < this.degree; i++ ){
         const num   = pad(i + 1, paddings[0]);
         const hand1 = pad(hands[i], paddings[2]);
         const hand2 = pad(oldLabels[i], paddings[1]);
         lines.push( `${num}| ${hand1}${this.notation !== "multihand" ? ` (${hand2})` : ""}` );
      }

   }

   lines.push("throw sequence"); {
      const matrix = [];
      for( const [i, action] of this.throws.entries() ){
         const releases = action.map( (release) => {
            let string;
            if( this.degree <= 2 )
               string = release.map( ({value, handFrom, handTo}) => `${value}${handFrom !== handTo ? "x" : ""}` ).join(",");
            else
               string = release.map( ({value, handFrom, handTo}) => `${value}${hands[handTo]}` ).join(",");
            return release.length === 1 ? string : `[${string}]`;
         } );
         matrix.push( [`${i + 1}|`, ...releases] );
      }

      const paddings = [];
      for( let i = 0; i < matrix[0].length; i++ ){
         paddings.push( Math.max(...matrix.map(row => row[i].length + 1)) );
      }

      lines.push( ...matrix.map(row => row.map((string, i) => pad(string, paddings[i])).join("")) );
   }
   
   lines.push("states"); {
      const padding = this.period.toString().length + 1;
      for( const [i, schedule] of this.states.entries() ){
         for( const [j, handState] of schedule.entries() )
            lines.push( `${pad(j ? " " : (i + 1), padding)}| [${handState.join(",")}]` );
      }
   }

   lines.push("strict states"); {
      const padding = this.fullPeriod.toString().length + 1;
      for( const [i, schedule] of this.strictStates.entries() ){
         for( const [j, handState] of schedule.entries() )
            lines.push( `${pad(j ? "" : (i + 1), padding)}| [${handState.map(balls => `[${balls.length ? balls.join(",") : "-"}]`).join(",")}]` );
      }
   }

   lines.push("orbits"); {
      const padding = this.orbits.length.toString().length + 1;
      for( const [i, orbit] of this.orbits.entries() ){
         lines.push( ...orbit.toString().split("\n").map((row, j) => `${pad(j ? "" : (i + 1), padding)}| ${row}`) );
      }
   }

   lines.push("composition"); {
      const padding = this.composition.length.toString().length + 1;
      for( const [i, prime] of this.composition.entries() ){
         lines.push( ...prime.toString().split("\n").map((row, j) => `${pad(j ? "" : (i + 1), padding)}| ${row}`) );
      }
   }

   lines.push(" ");

   console.log( lines.join("\n") );

}


function pad( string, length ){
   
   if( typeof string !== "string" )
      string = string.toString();

   length++;
   return string.length >= length ? string : `${Array(length - string.length).join(" ")}${string}`;

}

class Siteswap {
   
   constructor( string, notations = "compressed" ){

      try{
         const { throws, notation } = parse$1(string, [].concat(notations));

         validate(throws);

         this.valid    = true;
         this.notation = notation;
         this.throws   = truncate(throws);
      }
      catch(e){
         this.valid = false;
         this.notation = notations;
         this.error = e.message;
         return this;
      }


      const throws       = this.throws;
      const values       = throws.reduce((result, action) => result.concat( ...action.map(release => release.map(({value}) => value)) ), []);

      this.degree        = throws[0].length;
      this.props         = values.reduce((sum, value) => sum + value) / throws.length;
      this.multiplex     = throws.reduce((max, action) => Math.max( max, ...action.map(({length}) => length) ), 0);
      this.greatestValue = Math.max(...values);

      this.states        = schedulise(this);
      this.strictStates  = scheduliseStrictly(this);
      this.orbits        = orbitise(this);
      this.composition   = decompose(this);

      this.period        = this.states.length;
      this.fullPeriod    = this.strictStates.length;
      this.prime         = this.composition.length === 1;
      this.groundState   = this.states.some(isGround);

   }

}

Siteswap.prototype.equals   = equals;
Siteswap.prototype.rotate   = rotate;
Siteswap.prototype.toString = toString;
Siteswap.prototype.log      = log;

module.exports = Siteswap;

return module.exports;});
