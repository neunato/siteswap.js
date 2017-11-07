(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Siteswap = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

// Validates the siteswap for collisions. Assumes that throws sequence structure is valid.

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

      if( action.some(release => !Array.isArray(release) || !release.every(({ value, handFrom, handTo }) => value !== undefined && handFrom !== undefined && handTo !== undefined)) )
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
               return;
            }
         }
      }
   }

}

function advance( action ){

   const greatestValue = this.schedule[0].length;
   if( greatestValue === 0 )
      return this;

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
// until the graph content is introduced, it can remain as is.

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
            schedule.push( Array(siteswap.greatestValue).fill(0) );
         }

         let found = 0;
         for( let beat = -1; found < siteswap.props; beat-- ){
            const action = siteswap.throws[((beat % siteswap.throws.length) + siteswap.throws.length) % siteswap.throws.length];
            for( const release of action ){
               for( const toss of release ){
                  if( beat + toss.value >= 0 ){
                     schedule[toss.handTo][beat + toss.value]++;
                     found++;
                  }
               }
            }
         }

         if( strict ){
            let ball = 0;
            for( let i = 0; i < siteswap.degree; i++ )
               schedule[i] = schedule[i].map( c => Array(c).fill().map(() => ++ball) );
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


function orbitise( throws, notation ){

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
			orbit.push( action.map( (release, j) => map[i][j] === orbit ? release : [{ value: 0, handFrom: j, handTo: j }] ) );
	}

	return orbits.map( orbit => new Siteswap(orbit, notation) );

}

// This is far from efficient as states are repeatedly compared with `.equals()`. I could map states to numbers,
// but that would be a temporary solution until the graph content arrives. Then, a map/array of known states will 
// be used, and `.equals()` will deal with references, not deep comparisons.

function decompose( states, throws, notation ){

	const composition = [];
   throws = [...throws];
   states = [...states];

   let last = 0;
	for( let to = 1; to <= states.length; to++ ){
		for( let from = to - 1; from >= last; from-- ){
			if( !states[to % states.length].equals(states[from]) )
            continue;

         let siteswap;

         // Prime siteswap.
			if( from === 0 && to === states.length ){
            if( !composition.length )
               return [this]
            siteswap = new Siteswap(throws.slice(from, to), notation);
			}
         // Composite siteswaps, no transition.
         else if( last === from ){
            siteswap = new Siteswap(throws.slice(from, to), notation);
            last = to;
         }
         else{
            // Composite siteswaps with transition.
            siteswap = new Siteswap(throws.splice(from, to - from), notation);
            states.splice(from, to - from);
            to = last;
         }

         add(composition, siteswap);
         break;
		}
	}

	return composition;

}

function add( collection, siteswap ){
   
   if( !collection.some(item => siteswap.equals(item)) )
      collection.push(siteswap);

}

function Rule(name, symbols, postprocess) {
    this.id = ++Rule.highestId;
    this.name = name;
    this.symbols = symbols;        // a list of literal | regex class | nonterminal
    this.postprocess = postprocess;
    return this;
}
Rule.highestId = 0;

Rule.prototype.toString = function(withCursorAt) {
    function stringifySymbolSequence (e) {
        return e.literal ? JSON.stringify(e.literal) :
               e.type ? '%' + e.type : e.toString();
    }
    var symbolSequence = (typeof withCursorAt === "undefined")
                         ? this.symbols.map(stringifySymbolSequence).join(' ')
                         : (   this.symbols.slice(0, withCursorAt).map(stringifySymbolSequence).join(' ')
                             + " ● "
                             + this.symbols.slice(withCursorAt).map(stringifySymbolSequence).join(' ')     );
    return this.name + " → " + symbolSequence;
};


// a State is a rule at a position from a given starting point in the input stream (reference)
function State$1(rule, dot, reference, wantedBy) {
    this.rule = rule;
    this.dot = dot;
    this.reference = reference;
    this.data = [];
    this.wantedBy = wantedBy;
    this.isComplete = this.dot === rule.symbols.length;
}

State$1.prototype.toString = function() {
    return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
};

State$1.prototype.nextState = function(child) {
    var state = new State$1(this.rule, this.dot + 1, this.reference, this.wantedBy);
    state.left = this;
    state.right = child;
    if (state.isComplete) {
        state.data = state.build();
    }
    return state;
};

State$1.prototype.build = function() {
    var children = [];
    var node = this;
    do {
        children.push(node.right.data);
        node = node.left;
    } while (node.left);
    children.reverse();
    return children;
};

State$1.prototype.finish = function() {
    if (this.rule.postprocess) {
        this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
    }
};


function Column(grammar, index) {
    this.grammar = grammar;
    this.index = index;
    this.states = [];
    this.wants = {}; // states indexed by the non-terminal they expect
    this.scannable = []; // list of states that expect a token
    this.completed = {}; // states that are nullable
}


Column.prototype.process = function(nextColumn) {
    var states = this.states;
    var wants = this.wants;
    var completed = this.completed;

    for (var w = 0; w < states.length; w++) { // nb. we push() during iteration
        var state = states[w];

        if (state.isComplete) {
            state.finish();
            if (state.data !== Parser.fail) {
                // complete
                var wantedBy = state.wantedBy;
                for (var i = wantedBy.length; i--; ) { // this line is hot
                    var left = wantedBy[i];
                    this.complete(left, state);
                }

                // special-case nullables
                if (state.reference === this.index) {
                    // make sure future predictors of this rule get completed.
                    var exp = state.rule.name;
                    (this.completed[exp] = this.completed[exp] || []).push(state);
                }
            }

        } else {
            // queue scannable states
            var exp = state.rule.symbols[state.dot];
            if (typeof exp !== 'string') {
                this.scannable.push(state);
                continue;
            }

            // predict
            if (wants[exp]) {
                wants[exp].push(state);

                if (completed.hasOwnProperty(exp)) {
                    var nulls = completed[exp];
                    for (var i = 0; i < nulls.length; i++) {
                        var right = nulls[i];
                        this.complete(state, right);
                    }
                }
            } else {
                wants[exp] = [state];
                this.predict(exp);
            }
        }
    }
};

Column.prototype.predict = function(exp) {
    var rules = this.grammar.byName[exp] || [];

    for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        var wantedBy = this.wants[exp];
        var s = new State$1(r, 0, this.index, wantedBy);
        this.states.push(s);
    }
};

Column.prototype.complete = function(left, right) {
    var inp = right.rule.name;
    if (left.rule.symbols[left.dot] === inp) {
        var copy = left.nextState(right);
        this.states.push(copy);
    }
};


function Grammar(rules, start) {
    this.rules = rules;
    this.start = start || this.rules[0].name;
    var byName = this.byName = {};
    this.rules.forEach(function(rule) {
        if (!byName.hasOwnProperty(rule.name)) {
            byName[rule.name] = [];
        }
        byName[rule.name].push(rule);
    });
}

// So we can allow passing (rules, start) directly to Parser for backwards compatibility
Grammar.fromCompiled = function(rules, start) {
    var lexer = rules.Lexer;
    if (rules.ParserStart) {
      start = rules.ParserStart;
      rules = rules.ParserRules;
    }
    var rules = rules.map(function (r) { return (new Rule(r.name, r.symbols, r.postprocess)); });
    var g = new Grammar(rules, start);
    g.lexer = lexer; // nb. storing lexer on Grammar is iffy, but unavoidable
    return g;
};


function StreamLexer() {
  this.reset("");
}

StreamLexer.prototype.reset = function(data, state) {
    this.buffer = data;
    this.index = 0;
    this.line = state ? state.line : 1;
    this.lastLineBreak = state ? -state.col : 0;
};

StreamLexer.prototype.next = function() {
    if (this.index < this.buffer.length) {
        var ch = this.buffer[this.index++];
        if (ch === '\n') {
          this.line += 1;
          this.lastLineBreak = this.index;
        }
        return {value: ch};
    }
};

StreamLexer.prototype.save = function() {
  return {
    line: this.line,
    col: this.index - this.lastLineBreak,
  }
};

StreamLexer.prototype.formatError = function(token, message) {
    // nb. this gets called after consuming the offending token,
    // so the culprit is index-1
    var buffer = this.buffer;
    if (typeof buffer === 'string') {
        var nextLineBreak = buffer.indexOf('\n', this.index);
        if (nextLineBreak === -1) nextLineBreak = buffer.length;
        var line = buffer.substring(this.lastLineBreak, nextLineBreak);
        var col = this.index - this.lastLineBreak;
        message += " at line " + this.line + " col " + col + ":\n\n";
        message += "  " + line + "\n";
        message += "  " + Array(col).join(" ") + "^";
        return message;
    } else {
        return message + " at index " + (this.index - 1);
    }
};


function Parser(rules, start, options) {
    if (rules instanceof Grammar) {
        var grammar = rules;
        var options = start;
    } else {
        var grammar = Grammar.fromCompiled(rules, start);
    }
    this.grammar = grammar;

    // Read options
    this.options = {
        keepHistory: false,
        lexer: grammar.lexer || new StreamLexer,
    };
    for (var key in (options || {})) {
        this.options[key] = options[key];
    }

    // Setup lexer
    this.lexer = this.options.lexer;
    this.lexerState = undefined;

    // Setup a table
    var column = new Column(grammar, 0);
    var table = this.table = [column];

    // I could be expecting anything.
    column.wants[grammar.start] = [];
    column.predict(grammar.start);
    // TODO what if start rule is nullable?
    column.process();
    this.current = 0; // token index
}

// create a reserved token for indicating a parse fail
Parser.fail = {};

Parser.prototype.feed = function(chunk) {
    var lexer = this.lexer;
    lexer.reset(chunk, this.lexerState);

    var token;
    while (token = lexer.next()) {
        // We add new states to table[current+1]
        var column = this.table[this.current];

        // GC unused states
        if (!this.options.keepHistory) {
            delete this.table[this.current - 1];
        }

        var n = this.current + 1;
        var nextColumn = new Column(this.grammar, n);
        this.table.push(nextColumn);

        // Advance all tokens that expect the symbol
        var literal = token.value;
        var value = lexer.constructor === StreamLexer ? token.value : token;
        var scannable = column.scannable;
        for (var w = scannable.length; w--; ) {
            var state = scannable[w];
            var expect = state.rule.symbols[state.dot];
            // Try to consume the token
            // either regex or literal
            if (expect.test ? expect.test(value) :
                expect.type ? expect.type === token.type
                            : expect.literal === literal) {
                // Add it
                var next = state.nextState({data: value, token: token, isToken: true, reference: n - 1});
                nextColumn.states.push(next);
            }
        }

        // Next, for each of the rules, we either
        // (a) complete it, and try to see if the reference row expected that
        //     rule
        // (b) predict the next nonterminal it expects by adding that
        //     nonterminal's start state
        // To prevent duplication, we also keep track of rules we have already
        // added

        nextColumn.process();

        // If needed, throw an error:
        if (nextColumn.states.length === 0) {
            // No states at all! This is not good.
            var message = this.lexer.formatError(token, "invalid syntax") + "\n";
            message += "Unexpected " + (token.type ? token.type + " token: " : "");
            message += JSON.stringify(token.value !== undefined ? token.value : token) + "\n";
            var err = new Error(message);
            err.offset = this.current;
            err.token = token;
            throw err;
        }

        // maybe save lexer state
        if (this.options.keepHistory) {
          column.lexerState = lexer.save();
        }

        this.current++;
    }
    if (column) {
      this.lexerState = lexer.save();
    }

    // Incrementally keep track of results
    this.results = this.finish();

    // Allow chaining, for whatever it's worth
    return this;
};

Parser.prototype.save = function() {
    var column = this.table[this.current];
    column.lexerState = this.lexerState;
    return column;
};

Parser.prototype.restore = function(column) {
    var index = column.index;
    this.current = index;
    this.table[index] = column;
    this.table.splice(index + 1);
    this.lexerState = column.lexerState;

    // Incrementally keep track of results
    this.results = this.finish();
};

// nb. deprecated: use save/restore instead!
Parser.prototype.rewind = function(index) {
    if (!this.options.keepHistory) {
        throw new Error('set option `keepHistory` to enable rewinding')
    }
    // nb. recall column (table) indicies fall between token indicies.
    //        col 0   --   token 0   --   col 1
    this.restore(this.table[index]);
};

Parser.prototype.finish = function() {
    // Return the possible parsings
    var considerations = [];
    var start = this.grammar.start;
    var column = this.table[this.table.length - 1];
    column.states.forEach(function (t) {
        if (t.rule.name === start
                && t.dot === t.rule.symbols.length
                && t.reference === 0
                && t.data !== Parser.fail) {
            considerations.push(t);
        }
    });
    return considerations.map(function(c) {return c.data; });
};

function alphabetic( degree ){

  const offset = "A".charCodeAt(0);
  const count = "Z".charCodeAt(0) - offset + 1;

  return range(degree).map( (hand, i) => range(Math.floor(i / count)).map(key => String.fromCharCode(offset + key % count)).concat(String.fromCharCode(offset + i % count)).join("") );
  
}

function range( n ){

  return [...Array(n).keys()];
  
}

// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(x) {return x[0]; }


function mirror( throws ){

   return throws.concat( throws.map( action => action.map( release => release.map(({ value, cross }) => ({ value, cross })) ).reverse() ));

}

function numerify( letter ){

   if( letter < "a" )
      return letter.charCodeAt(0) - "A".charCodeAt(0) + 36;
   else
      return letter.charCodeAt(0) - "a".charCodeAt(0) + 10;

}

function finaliseAsync( throws ){

   return throws.map( ([release]) => [release.map( ({value}) => ({ value, handFrom: 0, handTo: 0 }) )] );

}

function finaliseSync( throws ){

   return throws.map( action => action.map((release, i) => release.map( ({value, cross}) => ({ value: value / 2, handFrom: i, handTo: cross ? 1 - i : i }) )) );

}

function finalisePassingAsync( siteswaps ){

   const choice = new Choice();
   const period = siteswaps.map(({length}) => length).reduce(lcm);
   const throws = [];
   for( let i = 0; i < period; i++ ){
      const action = siteswaps.map(actions => actions[i % actions.length][0]).map(function(release, handFrom){
         return release.map(function({value, pass}){
            if( pass ){
               choice.pick(typeof pass);
               if( pass === true )
                  pass = 2 - handFrom;
            }
            const handTo = !pass ? handFrom : (pass - 1);
            return { value, handFrom, handTo };
         })
      });
      throws.push( action );
   }
   return throws;

}

function finalisePassingSync( siteswaps ){

   const choice = new Choice();
   const period = siteswaps.map(({length}) => length).reduce(lcm);
   const throws = [];
   for( let i = 0; i < period; i++ ){
      const action = Array.prototype.concat( ...siteswaps.map(siteswap => siteswap[i % siteswap.length]) ).map(function(release, handFrom){
         return release.map(function({value, pass, cross}){
            if( pass ){
               choice.pick(typeof pass);
               if( pass === true )
                  pass = 2 - Math.floor(handFrom / 2);
            }
            const handTo = (pass ? ((pass - 1) * 2 + handFrom % 2) : handFrom) + (cross ? (handFrom % 2 ? -1 : 1) : 0);
            return { value: value / 2, handFrom, handTo };
         })
      });
      throws.push( action );
   }
   return throws;

}




function finaliseMultihand( rows ){

   const hands = alphabetic(rows.length);
   const period = rows.map(({length}) => length).reduce(lcm);
   const throws = [];
   for( let i = 0; i < period; i++ ){
      const action = rows.map(row => row[i % row.length]).map(function(release, handFrom){
         return release.map(function({ value, hand, offset }){
            const handTo = hand ? hands.indexOf(hand) : (handFrom + offset);
            return { value, handFrom, handTo };
         });
      });
      throws.push( action );
   }
   return throws;
   
}

function lcm( a, b ){

   const greater = Math.max(a, b);
   const smaller = Math.min(a, b);
   let result = greater;
   while( result % smaller !== 0 )
      result += greater;
   return result;

}

class Choice {

   pick( value ){

      if( !this.hasOwnProperty("value") )
         this.value = value;
      else if( this.value !== value )
         throw new Error("Consistency, please.");

   }

}

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "digit", "symbols": [/[0-9]/], "postprocess": ([match]) => Number(match)},
    {"name": "digit_even", "symbols": [/[02468]/], "postprocess": ([match]) => Number(match)},
    {"name": "letter", "symbols": [/[a-zA-Z]/], "postprocess": id},
    {"name": "letter_capital", "symbols": [/[A-Z]/], "postprocess": id},
    {"name": "letter_even", "symbols": [/[acegikmoqsuwyACEGIKMOQSUWY]/], "postprocess": id},
    {"name": "integer", "symbols": [/[0-9]/], "postprocess": ([match]) => Number(match)},
    {"name": "integer$e$1", "symbols": [/[0-9]/]},
    {"name": "integer$e$1", "symbols": ["integer$e$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer", "symbols": [/[1-9]/, "integer$e$1"], "postprocess": ([first, rest]) => Number([first, ...rest].join(""))},
    {"name": "integer_even", "symbols": [/[02468]/], "postprocess": ([match]) => Number(match)},
    {"name": "integer_even$e$1", "symbols": []},
    {"name": "integer_even$e$1", "symbols": ["integer_even$e$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer_even", "symbols": [/[1-9]/, "integer_even$e$1", /[02468]/], "postprocess": ([first, rest, last]) => Number([first, ...rest, last].join(""))},
    {"name": "cross", "symbols": [{"literal":"x"}], "postprocess": () => true},
    {"name": "crosspass", "symbols": [{"literal":"p"}], "postprocess": () => true},
    {"name": "pass", "symbols": [{"literal":"p"}, "integer"], "postprocess": ([, target]) => target},
    {"name": "_$e$1", "symbols": []},
    {"name": "_$e$1", "symbols": ["_$e$1", {"literal":" "}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$e$1"], "postprocess": () => null},
    {"name": "standard_async$m$2$m$2", "symbols": ["standard_async_toss"]},
    {"name": "standard_async$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "standard_async$m$2$m$1", "symbols": ["standard_async$m$2$m$2"], "postprocess": id},
    {"name": "standard_async$m$2$m$1$e$1$s$1", "symbols": ["_", "standard_async$m$2$m$3", "_", "standard_async$m$2$m$2"]},
    {"name": "standard_async$m$2$m$1$e$1", "symbols": ["standard_async$m$2$m$1$e$1$s$1"]},
    {"name": "standard_async$m$2$m$1$e$1$s$2", "symbols": ["_", "standard_async$m$2$m$3", "_", "standard_async$m$2$m$2"]},
    {"name": "standard_async$m$2$m$1$e$1", "symbols": ["standard_async$m$2$m$1$e$1", "standard_async$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$m$2$m$1", "symbols": [{"literal":"["}, "_", "standard_async$m$2$m$2", "standard_async$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$m$2", "symbols": ["standard_async$m$2$m$1"]},
    {"name": "standard_async$m$3", "symbols": [{"literal":","}]},
    {"name": "standard_async$m$1$m$2$m$2", "symbols": ["standard_async$m$2"]},
    {"name": "standard_async$m$1$m$2$m$3", "symbols": ["standard_async$m$3"]},
    {"name": "standard_async$m$1$m$2$m$1$e$1", "symbols": []},
    {"name": "standard_async$m$1$m$2$m$1$e$1$s$1", "symbols": ["_", "standard_async$m$1$m$2$m$3", "_", "standard_async$m$1$m$2$m$2"]},
    {"name": "standard_async$m$1$m$2$m$1$e$1", "symbols": ["standard_async$m$1$m$2$m$1$e$1", "standard_async$m$1$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$m$1$m$2$m$1", "symbols": ["standard_async$m$1$m$2$m$2", "standard_async$m$1$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$m$1$m$2", "symbols": ["standard_async$m$1$m$2$m$1"]},
    {"name": "standard_async$m$1$m$1", "symbols": ["_", "standard_async$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_async$m$1", "symbols": ["standard_async$m$1$m$1"], "postprocess": id},
    {"name": "standard_async", "symbols": ["standard_async$m$1"], "postprocess": ([throws])  => finaliseAsync(throws)},
    {"name": "standard_async$m$5$m$2", "symbols": ["standard_async_toss"]},
    {"name": "standard_async$m$5$m$3", "symbols": [{"literal":" "}]},
    {"name": "standard_async$m$5$m$1", "symbols": ["standard_async$m$5$m$2"], "postprocess": id},
    {"name": "standard_async$m$5$m$1$e$1$s$1", "symbols": ["_", "standard_async$m$5$m$3", "_", "standard_async$m$5$m$2"]},
    {"name": "standard_async$m$5$m$1$e$1", "symbols": ["standard_async$m$5$m$1$e$1$s$1"]},
    {"name": "standard_async$m$5$m$1$e$1$s$2", "symbols": ["_", "standard_async$m$5$m$3", "_", "standard_async$m$5$m$2"]},
    {"name": "standard_async$m$5$m$1$e$1", "symbols": ["standard_async$m$5$m$1$e$1", "standard_async$m$5$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$m$5$m$1", "symbols": [{"literal":"["}, "_", "standard_async$m$5$m$2", "standard_async$m$5$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$m$5", "symbols": ["standard_async$m$5$m$1"]},
    {"name": "standard_async$m$6", "symbols": [{"literal":" "}]},
    {"name": "standard_async$m$4$m$2$m$2", "symbols": ["standard_async$m$5"]},
    {"name": "standard_async$m$4$m$2$m$3", "symbols": ["standard_async$m$6"]},
    {"name": "standard_async$m$4$m$2$m$1$e$1", "symbols": []},
    {"name": "standard_async$m$4$m$2$m$1$e$1$s$1", "symbols": ["_", "standard_async$m$4$m$2$m$3", "_", "standard_async$m$4$m$2$m$2"]},
    {"name": "standard_async$m$4$m$2$m$1$e$1", "symbols": ["standard_async$m$4$m$2$m$1$e$1", "standard_async$m$4$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$m$4$m$2$m$1", "symbols": ["standard_async$m$4$m$2$m$2", "standard_async$m$4$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$m$4$m$2", "symbols": ["standard_async$m$4$m$2$m$1"]},
    {"name": "standard_async$m$4$m$1", "symbols": ["_", "standard_async$m$4$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_async$m$4", "symbols": ["standard_async$m$4$m$1"], "postprocess": id},
    {"name": "standard_async", "symbols": ["standard_async$m$4"], "postprocess": ([throws])  => finaliseAsync(throws)},
    {"name": "standard_async_toss", "symbols": ["integer"], "postprocess": ([value]) => ({ value })},
    {"name": "standard_sync$m$2$m$2", "symbols": ["standard_sync_toss"]},
    {"name": "standard_sync$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "standard_sync$m$2$m$1", "symbols": ["standard_sync$m$2$m$2"], "postprocess": id},
    {"name": "standard_sync$m$2$m$1$e$1$s$1", "symbols": ["_", "standard_sync$m$2$m$3", "_", "standard_sync$m$2$m$2"]},
    {"name": "standard_sync$m$2$m$1$e$1", "symbols": ["standard_sync$m$2$m$1$e$1$s$1"]},
    {"name": "standard_sync$m$2$m$1$e$1$s$2", "symbols": ["_", "standard_sync$m$2$m$3", "_", "standard_sync$m$2$m$2"]},
    {"name": "standard_sync$m$2$m$1$e$1", "symbols": ["standard_sync$m$2$m$1$e$1", "standard_sync$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$m$2$m$1", "symbols": [{"literal":"["}, "_", "standard_sync$m$2$m$2", "standard_sync$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_sync$m$2", "symbols": ["standard_sync$m$2$m$1"]},
    {"name": "standard_sync$m$3", "symbols": [{"literal":","}]},
    {"name": "standard_sync$m$1$m$2$s$1$m$2$m$2", "symbols": ["standard_sync$m$2"]},
    {"name": "standard_sync$m$1$m$2$s$1$m$2$m$3", "symbols": ["standard_sync$m$3"]},
    {"name": "standard_sync$m$1$m$2$s$1$m$2$m$1", "symbols": [{"literal":"("}, "_", "standard_sync$m$1$m$2$s$1$m$2$m$2", "_", "standard_sync$m$1$m$2$s$1$m$2$m$3", "_", "standard_sync$m$1$m$2$s$1$m$2$m$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "standard_sync$m$1$m$2$s$1$m$2", "symbols": ["standard_sync$m$1$m$2$s$1$m$2$m$1"]},
    {"name": "standard_sync$m$1$m$2$s$1$m$3", "symbols": ["_"]},
    {"name": "standard_sync$m$1$m$2$s$1$m$1$e$1", "symbols": []},
    {"name": "standard_sync$m$1$m$2$s$1$m$1$e$1$s$1", "symbols": ["standard_sync$m$1$m$2$s$1$m$3", "standard_sync$m$1$m$2$s$1$m$2"]},
    {"name": "standard_sync$m$1$m$2$s$1$m$1$e$1", "symbols": ["standard_sync$m$1$m$2$s$1$m$1$e$1", "standard_sync$m$1$m$2$s$1$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$m$1$m$2$s$1$m$1", "symbols": ["standard_sync$m$1$m$2$s$1$m$2", "standard_sync$m$1$m$2$s$1$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "standard_sync$m$1$m$2$s$1$e$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "standard_sync$m$1$m$2$s$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync$m$1$m$2$s$1", "symbols": ["standard_sync$m$1$m$2$s$1$m$1", "_", "standard_sync$m$1$m$2$s$1$e$1"]},
    {"name": "standard_sync$m$1$m$2", "symbols": ["standard_sync$m$1$m$2$s$1"]},
    {"name": "standard_sync$m$1$m$1", "symbols": ["_", "standard_sync$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_sync$m$1", "symbols": ["standard_sync$m$1$m$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "standard_sync", "symbols": ["standard_sync$m$1"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "standard_sync$m$5$m$2", "symbols": ["standard_sync_toss"]},
    {"name": "standard_sync$m$5$m$3", "symbols": [{"literal":" "}]},
    {"name": "standard_sync$m$5$m$1", "symbols": ["standard_sync$m$5$m$2"], "postprocess": id},
    {"name": "standard_sync$m$5$m$1$e$1$s$1", "symbols": ["_", "standard_sync$m$5$m$3", "_", "standard_sync$m$5$m$2"]},
    {"name": "standard_sync$m$5$m$1$e$1", "symbols": ["standard_sync$m$5$m$1$e$1$s$1"]},
    {"name": "standard_sync$m$5$m$1$e$1$s$2", "symbols": ["_", "standard_sync$m$5$m$3", "_", "standard_sync$m$5$m$2"]},
    {"name": "standard_sync$m$5$m$1$e$1", "symbols": ["standard_sync$m$5$m$1$e$1", "standard_sync$m$5$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$m$5$m$1", "symbols": [{"literal":"["}, "_", "standard_sync$m$5$m$2", "standard_sync$m$5$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_sync$m$5", "symbols": ["standard_sync$m$5$m$1"]},
    {"name": "standard_sync$m$6", "symbols": [{"literal":" "}]},
    {"name": "standard_sync$m$4$m$2$s$1$m$2$m$2", "symbols": ["standard_sync$m$5"]},
    {"name": "standard_sync$m$4$m$2$s$1$m$2$m$3", "symbols": ["standard_sync$m$6"]},
    {"name": "standard_sync$m$4$m$2$s$1$m$2$m$1", "symbols": [{"literal":"("}, "_", "standard_sync$m$4$m$2$s$1$m$2$m$2", "_", "standard_sync$m$4$m$2$s$1$m$2$m$3", "_", "standard_sync$m$4$m$2$s$1$m$2$m$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "standard_sync$m$4$m$2$s$1$m$2", "symbols": ["standard_sync$m$4$m$2$s$1$m$2$m$1"]},
    {"name": "standard_sync$m$4$m$2$s$1$m$3", "symbols": ["_"]},
    {"name": "standard_sync$m$4$m$2$s$1$m$1$e$1", "symbols": []},
    {"name": "standard_sync$m$4$m$2$s$1$m$1$e$1$s$1", "symbols": ["standard_sync$m$4$m$2$s$1$m$3", "standard_sync$m$4$m$2$s$1$m$2"]},
    {"name": "standard_sync$m$4$m$2$s$1$m$1$e$1", "symbols": ["standard_sync$m$4$m$2$s$1$m$1$e$1", "standard_sync$m$4$m$2$s$1$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$m$4$m$2$s$1$m$1", "symbols": ["standard_sync$m$4$m$2$s$1$m$2", "standard_sync$m$4$m$2$s$1$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "standard_sync$m$4$m$2$s$1$e$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "standard_sync$m$4$m$2$s$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync$m$4$m$2$s$1", "symbols": ["standard_sync$m$4$m$2$s$1$m$1", "_", "standard_sync$m$4$m$2$s$1$e$1"]},
    {"name": "standard_sync$m$4$m$2", "symbols": ["standard_sync$m$4$m$2$s$1"]},
    {"name": "standard_sync$m$4$m$1", "symbols": ["_", "standard_sync$m$4$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_sync$m$4", "symbols": ["standard_sync$m$4$m$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "standard_sync", "symbols": ["standard_sync$m$4"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "standard_sync_toss$e$1", "symbols": ["cross"], "postprocess": id},
    {"name": "standard_sync_toss$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync_toss", "symbols": ["integer_even", "standard_sync_toss$e$1"], "postprocess": ([value, cross]) => ({ value, cross: !!cross })},
    {"name": "compressed_async$m$2$m$2", "symbols": ["compressed_async_toss"]},
    {"name": "compressed_async$m$2$m$3", "symbols": []},
    {"name": "compressed_async$m$2$m$1", "symbols": ["compressed_async$m$2$m$2"], "postprocess": id},
    {"name": "compressed_async$m$2$m$1$e$1$s$1", "symbols": ["compressed_async$m$2$m$3", "compressed_async$m$2$m$2"]},
    {"name": "compressed_async$m$2$m$1$e$1", "symbols": ["compressed_async$m$2$m$1$e$1$s$1"]},
    {"name": "compressed_async$m$2$m$1$e$1$s$2", "symbols": ["compressed_async$m$2$m$3", "compressed_async$m$2$m$2"]},
    {"name": "compressed_async$m$2$m$1$e$1", "symbols": ["compressed_async$m$2$m$1$e$1", "compressed_async$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_async$m$2$m$1", "symbols": [{"literal":"["}, "compressed_async$m$2$m$2", "compressed_async$m$2$m$1$e$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_async$m$2", "symbols": ["compressed_async$m$2$m$1"]},
    {"name": "compressed_async$m$3", "symbols": []},
    {"name": "compressed_async$m$1$m$2$m$2", "symbols": ["compressed_async$m$2"]},
    {"name": "compressed_async$m$1$m$2$m$3", "symbols": ["compressed_async$m$3"]},
    {"name": "compressed_async$m$1$m$2$m$1$e$1", "symbols": []},
    {"name": "compressed_async$m$1$m$2$m$1$e$1$s$1", "symbols": ["compressed_async$m$1$m$2$m$3", "compressed_async$m$1$m$2$m$2"]},
    {"name": "compressed_async$m$1$m$2$m$1$e$1", "symbols": ["compressed_async$m$1$m$2$m$1$e$1", "compressed_async$m$1$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_async$m$1$m$2$m$1", "symbols": ["compressed_async$m$1$m$2$m$2", "compressed_async$m$1$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_async$m$1$m$2", "symbols": ["compressed_async$m$1$m$2$m$1"]},
    {"name": "compressed_async$m$1$m$1", "symbols": ["_", "compressed_async$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_async$m$1", "symbols": ["compressed_async$m$1$m$1"], "postprocess": id},
    {"name": "compressed_async", "symbols": ["compressed_async$m$1"], "postprocess": ([throws]) => finaliseAsync(throws)},
    {"name": "compressed_async_toss", "symbols": ["digit"], "postprocess": ([value]) => ({ value })},
    {"name": "compressed_async_toss", "symbols": ["letter"], "postprocess": ([value]) => ({ value: numerify(value) })},
    {"name": "compressed_sync$m$2$m$2", "symbols": ["compressed_sync_toss"]},
    {"name": "compressed_sync$m$2$m$3", "symbols": []},
    {"name": "compressed_sync$m$2$m$1", "symbols": ["compressed_sync$m$2$m$2"], "postprocess": id},
    {"name": "compressed_sync$m$2$m$1$e$1$s$1", "symbols": ["compressed_sync$m$2$m$3", "compressed_sync$m$2$m$2"]},
    {"name": "compressed_sync$m$2$m$1$e$1", "symbols": ["compressed_sync$m$2$m$1$e$1$s$1"]},
    {"name": "compressed_sync$m$2$m$1$e$1$s$2", "symbols": ["compressed_sync$m$2$m$3", "compressed_sync$m$2$m$2"]},
    {"name": "compressed_sync$m$2$m$1$e$1", "symbols": ["compressed_sync$m$2$m$1$e$1", "compressed_sync$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$m$2$m$1", "symbols": [{"literal":"["}, "compressed_sync$m$2$m$2", "compressed_sync$m$2$m$1$e$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_sync$m$2", "symbols": ["compressed_sync$m$2$m$1"]},
    {"name": "compressed_sync$m$3", "symbols": [{"literal":","}]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1$m$2", "symbols": ["compressed_sync$m$2"]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1$m$3", "symbols": ["compressed_sync$m$3"]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1$m$1", "symbols": [{"literal":"("}, "compressed_sync$m$1$m$2$s$1$e$1$m$2", "compressed_sync$m$1$m$2$s$1$e$1$m$3", "compressed_sync$m$1$m$2$s$1$e$1$m$2", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1", "symbols": ["compressed_sync$m$1$m$2$s$1$e$1$m$1"]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1$m$5", "symbols": ["compressed_sync$m$2"]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1$m$6", "symbols": ["compressed_sync$m$3"]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1$m$4", "symbols": [{"literal":"("}, "compressed_sync$m$1$m$2$s$1$e$1$m$5", "compressed_sync$m$1$m$2$s$1$e$1$m$6", "compressed_sync$m$1$m$2$s$1$e$1$m$5", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$m$1$m$2$s$1$e$1", "symbols": ["compressed_sync$m$1$m$2$s$1$e$1", "compressed_sync$m$1$m$2$s$1$e$1$m$4"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$m$1$m$2$s$1$e$2", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "compressed_sync$m$1$m$2$s$1$e$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync$m$1$m$2$s$1", "symbols": ["compressed_sync$m$1$m$2$s$1$e$1", "compressed_sync$m$1$m$2$s$1$e$2"]},
    {"name": "compressed_sync$m$1$m$2", "symbols": ["compressed_sync$m$1$m$2$s$1"]},
    {"name": "compressed_sync$m$1$m$1", "symbols": ["_", "compressed_sync$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_sync$m$1", "symbols": ["compressed_sync$m$1$m$1"], "postprocess": ([[actions, mirrored]])   => mirrored ? mirror(actions) : actions},
    {"name": "compressed_sync", "symbols": ["compressed_sync$m$1"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "compressed_sync$m$5$m$2", "symbols": ["compressed_sync_toss"]},
    {"name": "compressed_sync$m$5$m$3", "symbols": []},
    {"name": "compressed_sync$m$5$m$1", "symbols": ["compressed_sync$m$5$m$2"], "postprocess": id},
    {"name": "compressed_sync$m$5$m$1$e$1$s$1", "symbols": ["compressed_sync$m$5$m$3", "compressed_sync$m$5$m$2"]},
    {"name": "compressed_sync$m$5$m$1$e$1", "symbols": ["compressed_sync$m$5$m$1$e$1$s$1"]},
    {"name": "compressed_sync$m$5$m$1$e$1$s$2", "symbols": ["compressed_sync$m$5$m$3", "compressed_sync$m$5$m$2"]},
    {"name": "compressed_sync$m$5$m$1$e$1", "symbols": ["compressed_sync$m$5$m$1$e$1", "compressed_sync$m$5$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$m$5$m$1", "symbols": [{"literal":"["}, "compressed_sync$m$5$m$2", "compressed_sync$m$5$m$1$e$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_sync$m$5", "symbols": ["compressed_sync$m$5$m$1"]},
    {"name": "compressed_sync$m$6", "symbols": []},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1$m$2", "symbols": ["compressed_sync$m$5"]},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1$m$3", "symbols": ["compressed_sync$m$6"]},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1$m$1", "symbols": [{"literal":"("}, "compressed_sync$m$4$m$2$s$1$e$1$m$2", "compressed_sync$m$4$m$2$s$1$e$1$m$3", "compressed_sync$m$4$m$2$s$1$e$1$m$2", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1", "symbols": ["compressed_sync$m$4$m$2$s$1$e$1$m$1"]},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1$m$5", "symbols": ["compressed_sync$m$5"]},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1$m$6", "symbols": ["compressed_sync$m$6"]},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1$m$4", "symbols": [{"literal":"("}, "compressed_sync$m$4$m$2$s$1$e$1$m$5", "compressed_sync$m$4$m$2$s$1$e$1$m$6", "compressed_sync$m$4$m$2$s$1$e$1$m$5", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$m$4$m$2$s$1$e$1", "symbols": ["compressed_sync$m$4$m$2$s$1$e$1", "compressed_sync$m$4$m$2$s$1$e$1$m$4"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$m$4$m$2$s$1$e$2", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "compressed_sync$m$4$m$2$s$1$e$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync$m$4$m$2$s$1", "symbols": ["compressed_sync$m$4$m$2$s$1$e$1", "compressed_sync$m$4$m$2$s$1$e$2"]},
    {"name": "compressed_sync$m$4$m$2", "symbols": ["compressed_sync$m$4$m$2$s$1"]},
    {"name": "compressed_sync$m$4$m$1", "symbols": ["_", "compressed_sync$m$4$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_sync$m$4", "symbols": ["compressed_sync$m$4$m$1"], "postprocess": ([[actions, mirrored]])   => mirrored ? mirror(actions) : actions},
    {"name": "compressed_sync", "symbols": ["compressed_sync$m$4"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "compressed_sync_toss$e$1", "symbols": ["cross"], "postprocess": id},
    {"name": "compressed_sync_toss$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync_toss", "symbols": ["digit_even", "compressed_sync_toss$e$1"], "postprocess": ([value, cross]) => ({ value,                  cross: !!cross })},
    {"name": "compressed_sync_toss$e$2", "symbols": ["cross"], "postprocess": id},
    {"name": "compressed_sync_toss$e$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync_toss", "symbols": ["letter_even", "compressed_sync_toss$e$2"], "postprocess": ([value, cross]) => ({ value: numerify(value), cross: !!cross })},
    {"name": "passing_async$m$2$m$2$m$2$m$2", "symbols": ["pass"]},
    {"name": "passing_async$m$2$m$2$m$2$m$1$e$1", "symbols": ["passing_async$m$2$m$2$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$2$m$2$m$2$m$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$m$2$m$2$m$2$m$1", "symbols": ["integer", "passing_async$m$2$m$2$m$2$m$1$e$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$m$2$m$2$m$2", "symbols": ["passing_async$m$2$m$2$m$2$m$1"]},
    {"name": "passing_async$m$2$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$m$2$m$2$m$1", "symbols": ["passing_async$m$2$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$2$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$2$m$2$m$3", "_", "passing_async$m$2$m$2$m$2"]},
    {"name": "passing_async$m$2$m$2$m$1$e$1", "symbols": ["passing_async$m$2$m$2$m$1$e$1$s$1"]},
    {"name": "passing_async$m$2$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_async$m$2$m$2$m$3", "_", "passing_async$m$2$m$2$m$2"]},
    {"name": "passing_async$m$2$m$2$m$1$e$1", "symbols": ["passing_async$m$2$m$2$m$1$e$1", "passing_async$m$2$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$2$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_async$m$2$m$2$m$2", "passing_async$m$2$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$2$m$2", "symbols": ["passing_async$m$2$m$2$m$1"]},
    {"name": "passing_async$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$m$2$m$1$m$2$m$2", "symbols": ["passing_async$m$2$m$2"]},
    {"name": "passing_async$m$2$m$1$m$2$m$3", "symbols": ["passing_async$m$2$m$3"]},
    {"name": "passing_async$m$2$m$1$m$2$m$1$e$1", "symbols": []},
    {"name": "passing_async$m$2$m$1$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$2$m$1$m$2$m$3", "_", "passing_async$m$2$m$1$m$2$m$2"]},
    {"name": "passing_async$m$2$m$1$m$2$m$1$e$1", "symbols": ["passing_async$m$2$m$1$m$2$m$1$e$1", "passing_async$m$2$m$1$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$2$m$1$m$2$m$1", "symbols": ["passing_async$m$2$m$1$m$2$m$2", "passing_async$m$2$m$1$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$2$m$1$m$2", "symbols": ["passing_async$m$2$m$1$m$2$m$1"]},
    {"name": "passing_async$m$2$m$1$m$1", "symbols": ["_", "passing_async$m$2$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$2$m$1", "symbols": ["passing_async$m$2$m$1$m$1"], "postprocess": id},
    {"name": "passing_async$m$2", "symbols": ["passing_async$m$2$m$1"]},
    {"name": "passing_async$m$1$m$2$s$1$e$1$s$1", "symbols": [{"literal":"|"}, "passing_async$m$2"]},
    {"name": "passing_async$m$1$m$2$s$1$e$1", "symbols": ["passing_async$m$1$m$2$s$1$e$1$s$1"]},
    {"name": "passing_async$m$1$m$2$s$1$e$1$s$2", "symbols": [{"literal":"|"}, "passing_async$m$2"]},
    {"name": "passing_async$m$1$m$2$s$1$e$1", "symbols": ["passing_async$m$1$m$2$s$1$e$1", "passing_async$m$1$m$2$s$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$1$m$2$s$1", "symbols": [{"literal":"<"}, "passing_async$m$2", "passing_async$m$1$m$2$s$1$e$1", {"literal":">"}]},
    {"name": "passing_async$m$1$m$2", "symbols": ["passing_async$m$1$m$2$s$1"]},
    {"name": "passing_async$m$1$m$1", "symbols": ["_", "passing_async$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$1", "symbols": ["passing_async$m$1$m$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_async", "symbols": ["passing_async$m$1"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_async$m$4$m$2$m$2$m$2", "symbols": ["pass"]},
    {"name": "passing_async$m$4$m$2$m$2$m$1$e$1", "symbols": ["passing_async$m$4$m$2$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$4$m$2$m$2$m$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$m$4$m$2$m$2$m$1", "symbols": ["integer", "passing_async$m$4$m$2$m$2$m$1$e$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$m$4$m$2$m$2", "symbols": ["passing_async$m$4$m$2$m$2$m$1"]},
    {"name": "passing_async$m$4$m$2$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$m$4$m$2$m$1", "symbols": ["passing_async$m$4$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$4$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$4$m$2$m$3", "_", "passing_async$m$4$m$2$m$2"]},
    {"name": "passing_async$m$4$m$2$m$1$e$1", "symbols": ["passing_async$m$4$m$2$m$1$e$1$s$1"]},
    {"name": "passing_async$m$4$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_async$m$4$m$2$m$3", "_", "passing_async$m$4$m$2$m$2"]},
    {"name": "passing_async$m$4$m$2$m$1$e$1", "symbols": ["passing_async$m$4$m$2$m$1$e$1", "passing_async$m$4$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$4$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_async$m$4$m$2$m$2", "passing_async$m$4$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$4$m$2", "symbols": ["passing_async$m$4$m$2$m$1"]},
    {"name": "passing_async$m$4$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$m$4$m$1$m$2$m$2", "symbols": ["passing_async$m$4$m$2"]},
    {"name": "passing_async$m$4$m$1$m$2$m$3", "symbols": ["passing_async$m$4$m$3"]},
    {"name": "passing_async$m$4$m$1$m$2$m$1$e$1", "symbols": []},
    {"name": "passing_async$m$4$m$1$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$4$m$1$m$2$m$3", "_", "passing_async$m$4$m$1$m$2$m$2"]},
    {"name": "passing_async$m$4$m$1$m$2$m$1$e$1", "symbols": ["passing_async$m$4$m$1$m$2$m$1$e$1", "passing_async$m$4$m$1$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$4$m$1$m$2$m$1", "symbols": ["passing_async$m$4$m$1$m$2$m$2", "passing_async$m$4$m$1$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$4$m$1$m$2", "symbols": ["passing_async$m$4$m$1$m$2$m$1"]},
    {"name": "passing_async$m$4$m$1$m$1", "symbols": ["_", "passing_async$m$4$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$4$m$1", "symbols": ["passing_async$m$4$m$1$m$1"], "postprocess": id},
    {"name": "passing_async$m$4", "symbols": ["passing_async$m$4$m$1"]},
    {"name": "passing_async$m$3$m$2$s$1$e$1$s$1", "symbols": [{"literal":"|"}, "passing_async$m$4"]},
    {"name": "passing_async$m$3$m$2$s$1$e$1", "symbols": ["passing_async$m$3$m$2$s$1$e$1$s$1"]},
    {"name": "passing_async$m$3$m$2$s$1$e$1$s$2", "symbols": [{"literal":"|"}, "passing_async$m$4"]},
    {"name": "passing_async$m$3$m$2$s$1$e$1", "symbols": ["passing_async$m$3$m$2$s$1$e$1", "passing_async$m$3$m$2$s$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$3$m$2$s$1", "symbols": [{"literal":"<"}, "passing_async$m$4", "passing_async$m$3$m$2$s$1$e$1", {"literal":">"}]},
    {"name": "passing_async$m$3$m$2", "symbols": ["passing_async$m$3$m$2$s$1"]},
    {"name": "passing_async$m$3$m$1", "symbols": ["_", "passing_async$m$3$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$3", "symbols": ["passing_async$m$3$m$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_async", "symbols": ["passing_async$m$3"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_async$m$6$m$2$m$2$m$2", "symbols": ["crosspass"]},
    {"name": "passing_async$m$6$m$2$m$2$m$1$e$1", "symbols": ["passing_async$m$6$m$2$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$6$m$2$m$2$m$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$m$6$m$2$m$2$m$1", "symbols": ["integer", "passing_async$m$6$m$2$m$2$m$1$e$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$m$6$m$2$m$2", "symbols": ["passing_async$m$6$m$2$m$2$m$1"]},
    {"name": "passing_async$m$6$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$m$6$m$2$m$1", "symbols": ["passing_async$m$6$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$6$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$6$m$2$m$3", "_", "passing_async$m$6$m$2$m$2"]},
    {"name": "passing_async$m$6$m$2$m$1$e$1", "symbols": ["passing_async$m$6$m$2$m$1$e$1$s$1"]},
    {"name": "passing_async$m$6$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_async$m$6$m$2$m$3", "_", "passing_async$m$6$m$2$m$2"]},
    {"name": "passing_async$m$6$m$2$m$1$e$1", "symbols": ["passing_async$m$6$m$2$m$1$e$1", "passing_async$m$6$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$6$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_async$m$6$m$2$m$2", "passing_async$m$6$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$6$m$2", "symbols": ["passing_async$m$6$m$2$m$1"]},
    {"name": "passing_async$m$6$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$m$6$m$1$m$2$m$2", "symbols": ["passing_async$m$6$m$2"]},
    {"name": "passing_async$m$6$m$1$m$2$m$3", "symbols": ["passing_async$m$6$m$3"]},
    {"name": "passing_async$m$6$m$1$m$2$m$1$e$1", "symbols": []},
    {"name": "passing_async$m$6$m$1$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$6$m$1$m$2$m$3", "_", "passing_async$m$6$m$1$m$2$m$2"]},
    {"name": "passing_async$m$6$m$1$m$2$m$1$e$1", "symbols": ["passing_async$m$6$m$1$m$2$m$1$e$1", "passing_async$m$6$m$1$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$6$m$1$m$2$m$1", "symbols": ["passing_async$m$6$m$1$m$2$m$2", "passing_async$m$6$m$1$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$6$m$1$m$2", "symbols": ["passing_async$m$6$m$1$m$2$m$1"]},
    {"name": "passing_async$m$6$m$1$m$1", "symbols": ["_", "passing_async$m$6$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$6$m$1", "symbols": ["passing_async$m$6$m$1$m$1"], "postprocess": id},
    {"name": "passing_async$m$6", "symbols": ["passing_async$m$6$m$1"]},
    {"name": "passing_async$m$5$m$2$s$1", "symbols": [{"literal":"<"}, "passing_async$m$6", {"literal":"|"}, "passing_async$m$6", {"literal":">"}]},
    {"name": "passing_async$m$5$m$2", "symbols": ["passing_async$m$5$m$2$s$1"]},
    {"name": "passing_async$m$5$m$1", "symbols": ["_", "passing_async$m$5$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$5", "symbols": ["passing_async$m$5$m$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_async", "symbols": ["passing_async$m$5"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_async$m$8$m$2$m$2$m$2", "symbols": ["crosspass"]},
    {"name": "passing_async$m$8$m$2$m$2$m$1$e$1", "symbols": ["passing_async$m$8$m$2$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$8$m$2$m$2$m$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$m$8$m$2$m$2$m$1", "symbols": ["integer", "passing_async$m$8$m$2$m$2$m$1$e$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$m$8$m$2$m$2", "symbols": ["passing_async$m$8$m$2$m$2$m$1"]},
    {"name": "passing_async$m$8$m$2$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$m$8$m$2$m$1", "symbols": ["passing_async$m$8$m$2$m$2"], "postprocess": id},
    {"name": "passing_async$m$8$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$8$m$2$m$3", "_", "passing_async$m$8$m$2$m$2"]},
    {"name": "passing_async$m$8$m$2$m$1$e$1", "symbols": ["passing_async$m$8$m$2$m$1$e$1$s$1"]},
    {"name": "passing_async$m$8$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_async$m$8$m$2$m$3", "_", "passing_async$m$8$m$2$m$2"]},
    {"name": "passing_async$m$8$m$2$m$1$e$1", "symbols": ["passing_async$m$8$m$2$m$1$e$1", "passing_async$m$8$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$8$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_async$m$8$m$2$m$2", "passing_async$m$8$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$8$m$2", "symbols": ["passing_async$m$8$m$2$m$1"]},
    {"name": "passing_async$m$8$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$m$8$m$1$m$2$m$2", "symbols": ["passing_async$m$8$m$2"]},
    {"name": "passing_async$m$8$m$1$m$2$m$3", "symbols": ["passing_async$m$8$m$3"]},
    {"name": "passing_async$m$8$m$1$m$2$m$1$e$1", "symbols": []},
    {"name": "passing_async$m$8$m$1$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_async$m$8$m$1$m$2$m$3", "_", "passing_async$m$8$m$1$m$2$m$2"]},
    {"name": "passing_async$m$8$m$1$m$2$m$1$e$1", "symbols": ["passing_async$m$8$m$1$m$2$m$1$e$1", "passing_async$m$8$m$1$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$m$8$m$1$m$2$m$1", "symbols": ["passing_async$m$8$m$1$m$2$m$2", "passing_async$m$8$m$1$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$m$8$m$1$m$2", "symbols": ["passing_async$m$8$m$1$m$2$m$1"]},
    {"name": "passing_async$m$8$m$1$m$1", "symbols": ["_", "passing_async$m$8$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$8$m$1", "symbols": ["passing_async$m$8$m$1$m$1"], "postprocess": id},
    {"name": "passing_async$m$8", "symbols": ["passing_async$m$8$m$1"]},
    {"name": "passing_async$m$7$m$2$s$1", "symbols": [{"literal":"<"}, "passing_async$m$8", {"literal":"|"}, "passing_async$m$8", {"literal":">"}]},
    {"name": "passing_async$m$7$m$2", "symbols": ["passing_async$m$7$m$2$s$1"]},
    {"name": "passing_async$m$7$m$1", "symbols": ["_", "passing_async$m$7$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$m$7", "symbols": ["passing_async$m$7$m$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_async", "symbols": ["passing_async$m$7"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_sync$m$2$m$2$m$2$m$2", "symbols": ["pass"]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1$m$2", "symbols": ["passing_sync$m$2$m$2$m$2$m$2"]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1$m$3", "symbols": ["cross"]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1$m$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$2$m$2$m$2$m$1$m$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$2$m$2$m$2$m$1$m$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$2$m$2$m$2$m$1$m$2", "passing_sync$m$2$m$2$m$2$m$1$m$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$2$m$2$m$2$m$1$m$3", "passing_sync$m$2$m$2$m$2$m$1$m$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$m$2$m$2$m$2$m$1", "symbols": ["integer_even", "passing_sync$m$2$m$2$m$2$m$1$m$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$m$2$m$2$m$2", "symbols": ["passing_sync$m$2$m$2$m$2$m$1"]},
    {"name": "passing_sync$m$2$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$m$2$m$2$m$1", "symbols": ["passing_sync$m$2$m$2$m$2"], "postprocess": id},
    {"name": "passing_sync$m$2$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_sync$m$2$m$2$m$3", "_", "passing_sync$m$2$m$2$m$2"]},
    {"name": "passing_sync$m$2$m$2$m$1$e$1", "symbols": ["passing_sync$m$2$m$2$m$1$e$1$s$1"]},
    {"name": "passing_sync$m$2$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_sync$m$2$m$2$m$3", "_", "passing_sync$m$2$m$2$m$2"]},
    {"name": "passing_sync$m$2$m$2$m$1$e$1", "symbols": ["passing_sync$m$2$m$2$m$1$e$1", "passing_sync$m$2$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$2$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_sync$m$2$m$2$m$2", "passing_sync$m$2$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$m$2$m$2", "symbols": ["passing_sync$m$2$m$2$m$1"]},
    {"name": "passing_sync$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$2$m$2", "symbols": ["passing_sync$m$2$m$2"]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$2$m$3", "symbols": ["passing_sync$m$2$m$3"]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$2$m$1", "symbols": [{"literal":"("}, "_", "passing_sync$m$2$m$1$m$2$s$1$m$2$m$2", "_", "passing_sync$m$2$m$1$m$2$s$1$m$2$m$3", "_", "passing_sync$m$2$m$1$m$2$s$1$m$2$m$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$2", "symbols": ["passing_sync$m$2$m$1$m$2$s$1$m$2$m$1"]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$3", "symbols": ["_"]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$1$e$1", "symbols": []},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$1$e$1$s$1", "symbols": ["passing_sync$m$2$m$1$m$2$s$1$m$3", "passing_sync$m$2$m$1$m$2$s$1$m$2"]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$1$e$1", "symbols": ["passing_sync$m$2$m$1$m$2$s$1$m$1$e$1", "passing_sync$m$2$m$1$m$2$s$1$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$m$1", "symbols": ["passing_sync$m$2$m$1$m$2$s$1$m$2", "passing_sync$m$2$m$1$m$2$s$1$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$e$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$m$2$m$1$m$2$s$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$m$2$m$1$m$2$s$1", "symbols": ["passing_sync$m$2$m$1$m$2$s$1$m$1", "_", "passing_sync$m$2$m$1$m$2$s$1$e$1"]},
    {"name": "passing_sync$m$2$m$1$m$2", "symbols": ["passing_sync$m$2$m$1$m$2$s$1"]},
    {"name": "passing_sync$m$2$m$1$m$1", "symbols": ["_", "passing_sync$m$2$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$2$m$1", "symbols": ["passing_sync$m$2$m$1$m$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$m$2", "symbols": ["passing_sync$m$2$m$1"]},
    {"name": "passing_sync$m$1$m$2$s$1$e$1$s$1", "symbols": [{"literal":"|"}, "passing_sync$m$2"]},
    {"name": "passing_sync$m$1$m$2$s$1$e$1", "symbols": ["passing_sync$m$1$m$2$s$1$e$1$s$1"]},
    {"name": "passing_sync$m$1$m$2$s$1$e$1$s$2", "symbols": [{"literal":"|"}, "passing_sync$m$2"]},
    {"name": "passing_sync$m$1$m$2$s$1$e$1", "symbols": ["passing_sync$m$1$m$2$s$1$e$1", "passing_sync$m$1$m$2$s$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$1$m$2$s$1", "symbols": [{"literal":"<"}, "passing_sync$m$2", "passing_sync$m$1$m$2$s$1$e$1", {"literal":">"}]},
    {"name": "passing_sync$m$1$m$2", "symbols": ["passing_sync$m$1$m$2$s$1"]},
    {"name": "passing_sync$m$1$m$1", "symbols": ["_", "passing_sync$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$1", "symbols": ["passing_sync$m$1$m$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_sync", "symbols": ["passing_sync$m$1"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "passing_sync$m$4$m$2$m$2$m$2", "symbols": ["pass"]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1$m$2", "symbols": ["passing_sync$m$4$m$2$m$2$m$2"]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1$m$3", "symbols": ["cross"]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1$m$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$4$m$2$m$2$m$1$m$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$4$m$2$m$2$m$1$m$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$4$m$2$m$2$m$1$m$2", "passing_sync$m$4$m$2$m$2$m$1$m$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$4$m$2$m$2$m$1$m$3", "passing_sync$m$4$m$2$m$2$m$1$m$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$m$4$m$2$m$2$m$1", "symbols": ["integer_even", "passing_sync$m$4$m$2$m$2$m$1$m$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$m$4$m$2$m$2", "symbols": ["passing_sync$m$4$m$2$m$2$m$1"]},
    {"name": "passing_sync$m$4$m$2$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$m$4$m$2$m$1", "symbols": ["passing_sync$m$4$m$2$m$2"], "postprocess": id},
    {"name": "passing_sync$m$4$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_sync$m$4$m$2$m$3", "_", "passing_sync$m$4$m$2$m$2"]},
    {"name": "passing_sync$m$4$m$2$m$1$e$1", "symbols": ["passing_sync$m$4$m$2$m$1$e$1$s$1"]},
    {"name": "passing_sync$m$4$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_sync$m$4$m$2$m$3", "_", "passing_sync$m$4$m$2$m$2"]},
    {"name": "passing_sync$m$4$m$2$m$1$e$1", "symbols": ["passing_sync$m$4$m$2$m$1$e$1", "passing_sync$m$4$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$4$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_sync$m$4$m$2$m$2", "passing_sync$m$4$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$m$4$m$2", "symbols": ["passing_sync$m$4$m$2$m$1"]},
    {"name": "passing_sync$m$4$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$2$m$2", "symbols": ["passing_sync$m$4$m$2"]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$2$m$3", "symbols": ["passing_sync$m$4$m$3"]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$2$m$1", "symbols": [{"literal":"("}, "_", "passing_sync$m$4$m$1$m$2$s$1$m$2$m$2", "_", "passing_sync$m$4$m$1$m$2$s$1$m$2$m$3", "_", "passing_sync$m$4$m$1$m$2$s$1$m$2$m$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$2", "symbols": ["passing_sync$m$4$m$1$m$2$s$1$m$2$m$1"]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$3", "symbols": ["_"]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$1$e$1", "symbols": []},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$1$e$1$s$1", "symbols": ["passing_sync$m$4$m$1$m$2$s$1$m$3", "passing_sync$m$4$m$1$m$2$s$1$m$2"]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$1$e$1", "symbols": ["passing_sync$m$4$m$1$m$2$s$1$m$1$e$1", "passing_sync$m$4$m$1$m$2$s$1$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$m$1", "symbols": ["passing_sync$m$4$m$1$m$2$s$1$m$2", "passing_sync$m$4$m$1$m$2$s$1$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$e$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$m$4$m$1$m$2$s$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$m$4$m$1$m$2$s$1", "symbols": ["passing_sync$m$4$m$1$m$2$s$1$m$1", "_", "passing_sync$m$4$m$1$m$2$s$1$e$1"]},
    {"name": "passing_sync$m$4$m$1$m$2", "symbols": ["passing_sync$m$4$m$1$m$2$s$1"]},
    {"name": "passing_sync$m$4$m$1$m$1", "symbols": ["_", "passing_sync$m$4$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$4$m$1", "symbols": ["passing_sync$m$4$m$1$m$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$m$4", "symbols": ["passing_sync$m$4$m$1"]},
    {"name": "passing_sync$m$3$m$2$s$1$e$1$s$1", "symbols": [{"literal":"|"}, "passing_sync$m$4"]},
    {"name": "passing_sync$m$3$m$2$s$1$e$1", "symbols": ["passing_sync$m$3$m$2$s$1$e$1$s$1"]},
    {"name": "passing_sync$m$3$m$2$s$1$e$1$s$2", "symbols": [{"literal":"|"}, "passing_sync$m$4"]},
    {"name": "passing_sync$m$3$m$2$s$1$e$1", "symbols": ["passing_sync$m$3$m$2$s$1$e$1", "passing_sync$m$3$m$2$s$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$3$m$2$s$1", "symbols": [{"literal":"<"}, "passing_sync$m$4", "passing_sync$m$3$m$2$s$1$e$1", {"literal":">"}]},
    {"name": "passing_sync$m$3$m$2", "symbols": ["passing_sync$m$3$m$2$s$1"]},
    {"name": "passing_sync$m$3$m$1", "symbols": ["_", "passing_sync$m$3$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$3", "symbols": ["passing_sync$m$3$m$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_sync", "symbols": ["passing_sync$m$3"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "passing_sync$m$6$m$2$m$2$m$2", "symbols": ["crosspass"]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1$m$2", "symbols": ["passing_sync$m$6$m$2$m$2$m$2"]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1$m$3", "symbols": ["cross"]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1$m$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$6$m$2$m$2$m$1$m$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$6$m$2$m$2$m$1$m$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$6$m$2$m$2$m$1$m$2", "passing_sync$m$6$m$2$m$2$m$1$m$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$6$m$2$m$2$m$1$m$3", "passing_sync$m$6$m$2$m$2$m$1$m$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$m$6$m$2$m$2$m$1", "symbols": ["integer_even", "passing_sync$m$6$m$2$m$2$m$1$m$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$m$6$m$2$m$2", "symbols": ["passing_sync$m$6$m$2$m$2$m$1"]},
    {"name": "passing_sync$m$6$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$m$6$m$2$m$1", "symbols": ["passing_sync$m$6$m$2$m$2"], "postprocess": id},
    {"name": "passing_sync$m$6$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_sync$m$6$m$2$m$3", "_", "passing_sync$m$6$m$2$m$2"]},
    {"name": "passing_sync$m$6$m$2$m$1$e$1", "symbols": ["passing_sync$m$6$m$2$m$1$e$1$s$1"]},
    {"name": "passing_sync$m$6$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_sync$m$6$m$2$m$3", "_", "passing_sync$m$6$m$2$m$2"]},
    {"name": "passing_sync$m$6$m$2$m$1$e$1", "symbols": ["passing_sync$m$6$m$2$m$1$e$1", "passing_sync$m$6$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$6$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_sync$m$6$m$2$m$2", "passing_sync$m$6$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$m$6$m$2", "symbols": ["passing_sync$m$6$m$2$m$1"]},
    {"name": "passing_sync$m$6$m$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$2$m$2", "symbols": ["passing_sync$m$6$m$2"]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$2$m$3", "symbols": ["passing_sync$m$6$m$3"]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$2$m$1", "symbols": [{"literal":"("}, "_", "passing_sync$m$6$m$1$m$2$s$1$m$2$m$2", "_", "passing_sync$m$6$m$1$m$2$s$1$m$2$m$3", "_", "passing_sync$m$6$m$1$m$2$s$1$m$2$m$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$2", "symbols": ["passing_sync$m$6$m$1$m$2$s$1$m$2$m$1"]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$3", "symbols": ["_"]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$1$e$1", "symbols": []},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$1$e$1$s$1", "symbols": ["passing_sync$m$6$m$1$m$2$s$1$m$3", "passing_sync$m$6$m$1$m$2$s$1$m$2"]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$1$e$1", "symbols": ["passing_sync$m$6$m$1$m$2$s$1$m$1$e$1", "passing_sync$m$6$m$1$m$2$s$1$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$m$1", "symbols": ["passing_sync$m$6$m$1$m$2$s$1$m$2", "passing_sync$m$6$m$1$m$2$s$1$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$e$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$m$6$m$1$m$2$s$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$m$6$m$1$m$2$s$1", "symbols": ["passing_sync$m$6$m$1$m$2$s$1$m$1", "_", "passing_sync$m$6$m$1$m$2$s$1$e$1"]},
    {"name": "passing_sync$m$6$m$1$m$2", "symbols": ["passing_sync$m$6$m$1$m$2$s$1"]},
    {"name": "passing_sync$m$6$m$1$m$1", "symbols": ["_", "passing_sync$m$6$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$6$m$1", "symbols": ["passing_sync$m$6$m$1$m$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$m$6", "symbols": ["passing_sync$m$6$m$1"]},
    {"name": "passing_sync$m$5$m$2$s$1", "symbols": [{"literal":"<"}, "passing_sync$m$6", {"literal":"|"}, "passing_sync$m$6", {"literal":">"}]},
    {"name": "passing_sync$m$5$m$2", "symbols": ["passing_sync$m$5$m$2$s$1"]},
    {"name": "passing_sync$m$5$m$1", "symbols": ["_", "passing_sync$m$5$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$5", "symbols": ["passing_sync$m$5$m$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_sync", "symbols": ["passing_sync$m$5"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "passing_sync$m$8$m$2$m$2$m$2", "symbols": ["crosspass"]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1$m$2", "symbols": ["passing_sync$m$8$m$2$m$2$m$2"]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1$m$3", "symbols": ["cross"]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1$m$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$8$m$2$m$2$m$1$m$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$8$m$2$m$2$m$1$m$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$8$m$2$m$2$m$1$m$2", "passing_sync$m$8$m$2$m$2$m$1$m$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1$m$1", "symbols": ["passing_sync$m$8$m$2$m$2$m$1$m$3", "passing_sync$m$8$m$2$m$2$m$1$m$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$m$8$m$2$m$2$m$1", "symbols": ["integer_even", "passing_sync$m$8$m$2$m$2$m$1$m$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$m$8$m$2$m$2", "symbols": ["passing_sync$m$8$m$2$m$2$m$1"]},
    {"name": "passing_sync$m$8$m$2$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$m$8$m$2$m$1", "symbols": ["passing_sync$m$8$m$2$m$2"], "postprocess": id},
    {"name": "passing_sync$m$8$m$2$m$1$e$1$s$1", "symbols": ["_", "passing_sync$m$8$m$2$m$3", "_", "passing_sync$m$8$m$2$m$2"]},
    {"name": "passing_sync$m$8$m$2$m$1$e$1", "symbols": ["passing_sync$m$8$m$2$m$1$e$1$s$1"]},
    {"name": "passing_sync$m$8$m$2$m$1$e$1$s$2", "symbols": ["_", "passing_sync$m$8$m$2$m$3", "_", "passing_sync$m$8$m$2$m$2"]},
    {"name": "passing_sync$m$8$m$2$m$1$e$1", "symbols": ["passing_sync$m$8$m$2$m$1$e$1", "passing_sync$m$8$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$8$m$2$m$1", "symbols": [{"literal":"["}, "_", "passing_sync$m$8$m$2$m$2", "passing_sync$m$8$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$m$8$m$2", "symbols": ["passing_sync$m$8$m$2$m$1"]},
    {"name": "passing_sync$m$8$m$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$2$m$2", "symbols": ["passing_sync$m$8$m$2"]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$2$m$3", "symbols": ["passing_sync$m$8$m$3"]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$2$m$1", "symbols": [{"literal":"("}, "_", "passing_sync$m$8$m$1$m$2$s$1$m$2$m$2", "_", "passing_sync$m$8$m$1$m$2$s$1$m$2$m$3", "_", "passing_sync$m$8$m$1$m$2$s$1$m$2$m$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$2", "symbols": ["passing_sync$m$8$m$1$m$2$s$1$m$2$m$1"]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$3", "symbols": ["_"]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$1$e$1", "symbols": []},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$1$e$1$s$1", "symbols": ["passing_sync$m$8$m$1$m$2$s$1$m$3", "passing_sync$m$8$m$1$m$2$s$1$m$2"]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$1$e$1", "symbols": ["passing_sync$m$8$m$1$m$2$s$1$m$1$e$1", "passing_sync$m$8$m$1$m$2$s$1$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$m$1", "symbols": ["passing_sync$m$8$m$1$m$2$s$1$m$2", "passing_sync$m$8$m$1$m$2$s$1$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$e$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$m$8$m$1$m$2$s$1$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$m$8$m$1$m$2$s$1", "symbols": ["passing_sync$m$8$m$1$m$2$s$1$m$1", "_", "passing_sync$m$8$m$1$m$2$s$1$e$1"]},
    {"name": "passing_sync$m$8$m$1$m$2", "symbols": ["passing_sync$m$8$m$1$m$2$s$1"]},
    {"name": "passing_sync$m$8$m$1$m$1", "symbols": ["_", "passing_sync$m$8$m$1$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$8$m$1", "symbols": ["passing_sync$m$8$m$1$m$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$m$8", "symbols": ["passing_sync$m$8$m$1"]},
    {"name": "passing_sync$m$7$m$2$s$1", "symbols": [{"literal":"<"}, "passing_sync$m$8", {"literal":"|"}, "passing_sync$m$8", {"literal":">"}]},
    {"name": "passing_sync$m$7$m$2", "symbols": ["passing_sync$m$7$m$2$s$1"]},
    {"name": "passing_sync$m$7$m$1", "symbols": ["_", "passing_sync$m$7$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$m$7", "symbols": ["passing_sync$m$7$m$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_sync", "symbols": ["passing_sync$m$7"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "multihand$m$2$m$2$m$2$m$2", "symbols": ["multihand_toss_alpha"]},
    {"name": "multihand$m$2$m$2$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "multihand$m$2$m$2$m$2$m$1", "symbols": ["multihand$m$2$m$2$m$2$m$2"], "postprocess": id},
    {"name": "multihand$m$2$m$2$m$2$m$1$e$1$s$1", "symbols": ["_", "multihand$m$2$m$2$m$2$m$3", "_", "multihand$m$2$m$2$m$2$m$2"]},
    {"name": "multihand$m$2$m$2$m$2$m$1$e$1", "symbols": ["multihand$m$2$m$2$m$2$m$1$e$1$s$1"]},
    {"name": "multihand$m$2$m$2$m$2$m$1$e$1$s$2", "symbols": ["_", "multihand$m$2$m$2$m$2$m$3", "_", "multihand$m$2$m$2$m$2$m$2"]},
    {"name": "multihand$m$2$m$2$m$2$m$1$e$1", "symbols": ["multihand$m$2$m$2$m$2$m$1$e$1", "multihand$m$2$m$2$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$m$2$m$2$m$2$m$1", "symbols": [{"literal":"["}, "_", "multihand$m$2$m$2$m$2$m$2", "multihand$m$2$m$2$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$m$2$m$2$m$2", "symbols": ["multihand$m$2$m$2$m$2$m$1"]},
    {"name": "multihand$m$2$m$2$m$3", "symbols": [{"literal":","}]},
    {"name": "multihand$m$2$m$2$m$1$e$1", "symbols": []},
    {"name": "multihand$m$2$m$2$m$1$e$1$s$1", "symbols": ["_", "multihand$m$2$m$2$m$3", "_", "multihand$m$2$m$2$m$2"]},
    {"name": "multihand$m$2$m$2$m$1$e$1", "symbols": ["multihand$m$2$m$2$m$1$e$1", "multihand$m$2$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$m$2$m$2$m$1", "symbols": ["multihand$m$2$m$2$m$2", "multihand$m$2$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$m$2$m$2", "symbols": ["multihand$m$2$m$2$m$1"]},
    {"name": "multihand$m$2$m$3", "symbols": [{"literal":"\n"}]},
    {"name": "multihand$m$2$m$1$e$1", "symbols": []},
    {"name": "multihand$m$2$m$1$e$1$s$1", "symbols": ["_", "multihand$m$2$m$3", "_", "multihand$m$2$m$2"]},
    {"name": "multihand$m$2$m$1$e$1", "symbols": ["multihand$m$2$m$1$e$1", "multihand$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$m$2$m$1", "symbols": ["multihand$m$2$m$2", "multihand$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$m$2", "symbols": ["multihand$m$2$m$1"]},
    {"name": "multihand$m$1", "symbols": ["_", "multihand$m$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "multihand", "symbols": ["multihand$m$1"], "postprocess": ([throws]) => finaliseMultihand(throws)},
    {"name": "multihand$m$4$m$2$m$2$m$2", "symbols": ["multihand_toss_num"]},
    {"name": "multihand$m$4$m$2$m$2$m$3", "symbols": []},
    {"name": "multihand$m$4$m$2$m$2$m$1", "symbols": ["multihand$m$4$m$2$m$2$m$2"], "postprocess": id},
    {"name": "multihand$m$4$m$2$m$2$m$1$e$1$s$1", "symbols": ["_", "multihand$m$4$m$2$m$2$m$3", "_", "multihand$m$4$m$2$m$2$m$2"]},
    {"name": "multihand$m$4$m$2$m$2$m$1$e$1", "symbols": ["multihand$m$4$m$2$m$2$m$1$e$1$s$1"]},
    {"name": "multihand$m$4$m$2$m$2$m$1$e$1$s$2", "symbols": ["_", "multihand$m$4$m$2$m$2$m$3", "_", "multihand$m$4$m$2$m$2$m$2"]},
    {"name": "multihand$m$4$m$2$m$2$m$1$e$1", "symbols": ["multihand$m$4$m$2$m$2$m$1$e$1", "multihand$m$4$m$2$m$2$m$1$e$1$s$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$m$4$m$2$m$2$m$1", "symbols": [{"literal":"["}, "_", "multihand$m$4$m$2$m$2$m$2", "multihand$m$4$m$2$m$2$m$1$e$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$m$4$m$2$m$2", "symbols": ["multihand$m$4$m$2$m$2$m$1"]},
    {"name": "multihand$m$4$m$2$m$3", "symbols": []},
    {"name": "multihand$m$4$m$2$m$1$e$1", "symbols": []},
    {"name": "multihand$m$4$m$2$m$1$e$1$s$1", "symbols": ["_", "multihand$m$4$m$2$m$3", "_", "multihand$m$4$m$2$m$2"]},
    {"name": "multihand$m$4$m$2$m$1$e$1", "symbols": ["multihand$m$4$m$2$m$1$e$1", "multihand$m$4$m$2$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$m$4$m$2$m$1", "symbols": ["multihand$m$4$m$2$m$2", "multihand$m$4$m$2$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$m$4$m$2", "symbols": ["multihand$m$4$m$2$m$1"]},
    {"name": "multihand$m$4$m$3", "symbols": [{"literal":"\n"}]},
    {"name": "multihand$m$4$m$1$e$1", "symbols": []},
    {"name": "multihand$m$4$m$1$e$1$s$1", "symbols": ["_", "multihand$m$4$m$3", "_", "multihand$m$4$m$2"]},
    {"name": "multihand$m$4$m$1$e$1", "symbols": ["multihand$m$4$m$1$e$1", "multihand$m$4$m$1$e$1$s$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$m$4$m$1", "symbols": ["multihand$m$4$m$2", "multihand$m$4$m$1$e$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$m$4", "symbols": ["multihand$m$4$m$1"]},
    {"name": "multihand$m$3", "symbols": ["_", "multihand$m$4", "_"], "postprocess": ([, [match]]) => match},
    {"name": "multihand", "symbols": ["multihand$m$3"], "postprocess": ([throws]) => finaliseMultihand(throws)},
    {"name": "multihand_toss_alpha", "symbols": ["letter_capital", "integer"], "postprocess": ([hand, value]) => ({ value, hand })},
    {"name": "multihand_toss_num$e$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "multihand_toss_num$e$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "multihand_toss_num", "symbols": [{"literal":"("}, "_", "multihand_toss_num$e$1", "integer", "_", {"literal":","}, "_", "integer", "_", {"literal":")"}], "postprocess": ([, , minus, hand, , , , value]) => ({ value, offset: hand * (minus ? -1 : 1) })}
]
  , ParserStart: "digit"
};

function parse$1( rule, string ){
   
   try{
      return new Parser(grammar.ParserRules, rule).feed(string).results;
   }
   catch(e){
      return [];
   }

}

const declaration = {

   limits: {
      degree: { min: 1, max: 1 }
   },
   hands: () => ["Hand"],
   parse: parse$1.bind(null, "standard_async"),
   unparse: throws => throws.map( ([release]) => release.length === 1 ? release[0].value : `[${release.map(({ value }) => value).join(",")}]`).join(",")

};

function unparseToss({ value, handFrom, handTo }){
   
   return `${value * 2}${handFrom !== handTo ? "x" : ""}`;

}

const declaration$1 = {

   limits: {
      degree: { min: 2, max: 2 }
   },
   hands: () => ["Left", "Right"],
   parse: parse$1.bind(null, "standard_sync"),
   unparse: throws => throws.map( action => "(" + action.map( release => release.length === 1 ? unparseToss(release[0]) : `[${release.map(unparseToss).join(",")}]` ) + ")"  ).join("")

};

const declaration$2 = {

   limits: {
      degree: { min: 1, max: 1 },
      greatestValue: { max: 61 }
   },
   hands: () => ["Hand"],
   parse: parse$1.bind(null, "compressed_async"),
   unparse: throws => throws.map( ([release]) => release.length === 1 ? release[0].value : `[${release.map(({ value }) => value).join("")}]`).join("")

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
   parse: parse$1.bind(null, "compressed_sync"),
   unparse: throws => throws.map( action => "(" + action.map( release => release.length === 1 ? unparseToss$1(release[0]) : `[${release.map(unparseToss$1).join("")}]` ) + ")"  ).join("")

};

const declaration$4 = {

   limits: {
      degree: { min: 2 }
   },
   hands: degree => Array(degree).fill().map((_, i) => `juggler ${i + 1}`),
   parse: parse$1.bind(null, "passing_async"),
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
      degree: { min: 4 }
   },
   hands: degree => Array(degree).fill().map((_, i) => `juggler ${Math.floor(i / 2) + 1}, hand ${i % 2 + 1}`),
   parse: parse$1.bind(null, "passing_sync"),
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

   hands: alphabetic,
   parse: parse$1.bind(null, "multihand"),
   unparse: unparse$2

};

function unparse$2( throws ){

   const count = throws[0].length;
   const hands = alphabetic(count);
   const rows = [];
   for( let i = 0; i < count; i++ ){
      const row = throws.map(action => unparseRelease$2(action[i], hands)).join(",");
      rows.push(row);
   }
   return rows.join("\n");

}

function unparseRelease$2( release, hands ){

   const string = release.map(({value, handTo}) => `${hands[handTo]}${value}`).join(",");
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

function parse( string, notations$$1 ){

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
      const [throws] = notations[notation].parse(string);
      if( throws )
         return { notation, throws };
   }

   throw new Error("Invalid syntax.");

}

function equals$1( siteswap ){

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

   return new Siteswap( [ ...throws.map((_, i) => throws[(i + count) % throws.length]) ], this.notation );

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
                                  (to[prop].min && this[prop] < to[prop].min)) )
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
      hands = alphabetic(this.degree);

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
      for( const [i, state] of this.states.entries() ){
         for( const [j, handState] of state.schedule.entries() )
            lines.push( `${pad(j ? " " : (i + 1), padding)}| [${handState.join(",")}]` );
      }
   }

   lines.push("strict states"); {
      const padding = this.fullPeriod.toString().length + 1;
      for( const [i, state] of this.strictStates.entries() ){
         for( const [j, handState] of state.schedule.entries() )
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
         const { throws, notation } = this.parse(string, [].concat(notations));
         this.validate(throws);
         this.truncate(throws);

         this.valid         = true;
         this.notation      = notation;
         this.throws        = throws;
      }
      catch(e){
         this.valid = false;
         this.notation = notations;
         this.error = e.message;
         return this;
      }      
      

      const values       = this.throws.reduce((result, action) => result.concat( ...action.map(release => release.map(({value}) => value)) ), []);

      this.degree        = this.throws[0].length;
      this.props         = values.reduce((sum, value) => sum + value) / this.throws.length;
      this.multiplex     = this.throws.reduce((max, action) => Math.max( max, ...action.map(({length}) => length) ), 0);
      this.greatestValue = Math.max(...values);

      this.states        = this.schedulise(this.throws, false);
      this.strictStates  = this.schedulise(this.throws, true);
      this.orbits        = this.orbitise(this.throws, this.notation);
      this.composition   = this.decompose(this.states, this.throws, this.notation);

      this.period        = this.states.length;
      this.fullPeriod    = this.strictStates.length;
      this.groundState   = this.states.some(({ground}) => ground);
      this.prime         = this.composition.length === 1;

   }

}


Siteswap.prototype.validate     = validate;
Siteswap.prototype.truncate     = truncate;
Siteswap.prototype.schedulise   = schedulise;
Siteswap.prototype.orbitise     = orbitise;
Siteswap.prototype.decompose    = decompose;
Siteswap.prototype.parse        = parse;
Siteswap.prototype.equals       = equals$1;
Siteswap.prototype.rotate       = rotate;
Siteswap.prototype.toString     = toString;
Siteswap.prototype.log          = log;

module.exports = Siteswap;

return module.exports;});