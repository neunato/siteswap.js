(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Siteswap = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

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

function Toss( value, handFrom, handTo ){

	this.value = value;
	this.handFrom = handFrom;
	this.handTo = handTo;

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
			orbit.push( action.map( (release, j) => map[i][j] === orbit ? release : [new Toss(0, null, null)] ) );
	}

	return orbits.map( orbit => new Siteswap(orbit, notation) );

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

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "digit", "symbols": [/[0-9]/], "postprocess": ([match]) => Number(match)},
    {"name": "digit_even", "symbols": [/[02468]/], "postprocess": ([match]) => Number(match)},
    {"name": "letter", "symbols": [/[a-zA-Z]/], "postprocess": id},
    {"name": "letter_even", "symbols": [/[acegikmoqsuwyACEGIKMOQSUWY]/], "postprocess": id},
    {"name": "integer", "symbols": [/[0-9]/], "postprocess": ([match]) => Number(match)},
    {"name": "integer$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "integer$ebnf$1", "symbols": ["integer$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer", "symbols": [/[1-9]/, "integer$ebnf$1"], "postprocess": ([first, rest]) => Number([first, ...rest].join(""))},
    {"name": "integer_even", "symbols": [/[02468]/], "postprocess": ([match]) => Number(match)},
    {"name": "integer_even$ebnf$1", "symbols": []},
    {"name": "integer_even$ebnf$1", "symbols": ["integer_even$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer_even", "symbols": [/[1-9]/, "integer_even$ebnf$1", /[02468]/], "postprocess": ([first, rest, last]) => Number([first, ...rest, last].join(""))},
    {"name": "cross", "symbols": [{"literal":"x"}], "postprocess": () => true},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", {"literal":" "}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$2", "symbols": ["standard_async_toss"]},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$1", "symbols": ["standard_async$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$2$macrocall$2$macrocall$3", "_", "standard_async$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_async$macrocall$2$macrocall$2$macrocall$3", "_", "standard_async$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_async$macrocall$2$macrocall$2$macrocall$2", "standard_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$2$macrocall$2", "symbols": ["standard_async$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "standard_async$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_async$macrocall$2$macrocall$1$macrocall$2", "symbols": ["standard_async$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$2$macrocall$1$macrocall$3", "symbols": ["standard_async$macrocall$2$macrocall$3"]},
    {"name": "standard_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$2$macrocall$1$macrocall$3", "_", "standard_async$macrocall$2$macrocall$1$macrocall$2"]},
    {"name": "standard_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "standard_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$2$macrocall$1$macrocall$1", "symbols": ["standard_async$macrocall$2$macrocall$1$macrocall$2", "standard_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$2$macrocall$1", "symbols": ["standard_async$macrocall$2$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "standard_async$macrocall$2", "symbols": ["standard_async$macrocall$2$macrocall$1"]},
    {"name": "standard_async$macrocall$1", "symbols": ["_", "standard_async$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_async", "symbols": ["standard_async$macrocall$1"], "postprocess": ([throws])  => finaliseAsync(throws)},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$2", "symbols": ["standard_async_toss"]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1", "symbols": ["standard_async$macrocall$4$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$4$macrocall$2$macrocall$3", "_", "standard_async$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_async$macrocall$4$macrocall$2$macrocall$3", "_", "standard_async$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_async$macrocall$4$macrocall$2$macrocall$2", "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$4$macrocall$2", "symbols": ["standard_async$macrocall$4$macrocall$2$macrocall$1"]},
    {"name": "standard_async$macrocall$4$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "standard_async$macrocall$4$macrocall$1$macrocall$2", "symbols": ["standard_async$macrocall$4$macrocall$2"]},
    {"name": "standard_async$macrocall$4$macrocall$1$macrocall$3", "symbols": ["standard_async$macrocall$4$macrocall$3"]},
    {"name": "standard_async$macrocall$4$macrocall$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_async$macrocall$4$macrocall$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$4$macrocall$1$macrocall$3", "_", "standard_async$macrocall$4$macrocall$1$macrocall$2"]},
    {"name": "standard_async$macrocall$4$macrocall$1$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$4$macrocall$1$macrocall$1$ebnf$1", "standard_async$macrocall$4$macrocall$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$4$macrocall$1$macrocall$1", "symbols": ["standard_async$macrocall$4$macrocall$1$macrocall$2", "standard_async$macrocall$4$macrocall$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$4$macrocall$1", "symbols": ["standard_async$macrocall$4$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "standard_async$macrocall$4", "symbols": ["standard_async$macrocall$4$macrocall$1"]},
    {"name": "standard_async$macrocall$3", "symbols": ["_", "standard_async$macrocall$4", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_async", "symbols": ["standard_async$macrocall$3"], "postprocess": ([throws])  => finaliseAsync(throws)},
    {"name": "standard_async_toss", "symbols": ["integer"], "postprocess": ([value]) => ({ value })},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$2", "symbols": ["standard_sync_toss"]},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$1", "symbols": ["standard_sync$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_sync$macrocall$2$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_sync$macrocall$2$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_sync$macrocall$2$macrocall$2$macrocall$2", "standard_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$2$macrocall$2", "symbols": ["standard_sync$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$2$macrocall$2", "symbols": ["standard_sync$macrocall$2$macrocall$2"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$2$macrocall$3", "symbols": ["standard_sync$macrocall$2$macrocall$3"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "standard_sync$macrocall$2$macrocall$1$macrocall$2$macrocall$2", "_", "standard_sync$macrocall$2$macrocall$1$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$2$macrocall$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$2", "symbols": ["standard_sync$macrocall$2$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$3", "symbols": ["_"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["standard_sync$macrocall$2$macrocall$1$macrocall$3", "standard_sync$macrocall$2$macrocall$1$macrocall$2"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "standard_sync$macrocall$2$macrocall$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$2$macrocall$1$macrocall$1", "symbols": ["standard_sync$macrocall$2$macrocall$1$macrocall$2", "standard_sync$macrocall$2$macrocall$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "standard_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync$macrocall$2$macrocall$1", "symbols": ["standard_sync$macrocall$2$macrocall$1$macrocall$1", "_", "standard_sync$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([actions, , mirrored]) => mirrored ? mirror(actions) : actions},
    {"name": "standard_sync$macrocall$2", "symbols": ["standard_sync$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$1", "symbols": ["_", "standard_sync$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_sync", "symbols": ["standard_sync$macrocall$1"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$2", "symbols": ["standard_sync_toss"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$1", "symbols": ["standard_sync$macrocall$4$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_sync$macrocall$4$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_sync$macrocall$4$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$4$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_sync$macrocall$4$macrocall$2$macrocall$2", "standard_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$4$macrocall$2", "symbols": ["standard_sync$macrocall$4$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$4$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$2$macrocall$2", "symbols": ["standard_sync$macrocall$4$macrocall$2"]},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$2$macrocall$3", "symbols": ["standard_sync$macrocall$4$macrocall$3"]},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "standard_sync$macrocall$4$macrocall$1$macrocall$2$macrocall$2", "_", "standard_sync$macrocall$4$macrocall$1$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$4$macrocall$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$2", "symbols": ["standard_sync$macrocall$4$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$3", "symbols": ["_"]},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["standard_sync$macrocall$4$macrocall$1$macrocall$3", "standard_sync$macrocall$4$macrocall$1$macrocall$2"]},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$4$macrocall$1$macrocall$1$ebnf$1", "standard_sync$macrocall$4$macrocall$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$4$macrocall$1$macrocall$1", "symbols": ["standard_sync$macrocall$4$macrocall$1$macrocall$2", "standard_sync$macrocall$4$macrocall$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$4$macrocall$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "standard_sync$macrocall$4$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync$macrocall$4$macrocall$1", "symbols": ["standard_sync$macrocall$4$macrocall$1$macrocall$1", "_", "standard_sync$macrocall$4$macrocall$1$ebnf$1"], "postprocess": ([actions, , mirrored]) => mirrored ? mirror(actions) : actions},
    {"name": "standard_sync$macrocall$4", "symbols": ["standard_sync$macrocall$4$macrocall$1"]},
    {"name": "standard_sync$macrocall$3", "symbols": ["_", "standard_sync$macrocall$4", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_sync", "symbols": ["standard_sync$macrocall$3"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "standard_sync_toss$ebnf$1", "symbols": ["cross"], "postprocess": id},
    {"name": "standard_sync_toss$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync_toss", "symbols": ["integer_even", "standard_sync_toss$ebnf$1"], "postprocess": ([value, cross]) => ({ value: value, cross: !!cross })},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$2", "symbols": ["compressed_async_toss"]},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$3", "symbols": []},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$1", "symbols": ["compressed_async$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_async$macrocall$2$macrocall$2$macrocall$3", "compressed_async$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["compressed_async$macrocall$2$macrocall$2$macrocall$3", "compressed_async$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_async$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "compressed_async$macrocall$2$macrocall$2$macrocall$2", "compressed_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_async$macrocall$2$macrocall$2", "symbols": ["compressed_async$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "compressed_async$macrocall$2$macrocall$3", "symbols": []},
    {"name": "compressed_async$macrocall$2$macrocall$1$macrocall$2", "symbols": ["compressed_async$macrocall$2$macrocall$2"]},
    {"name": "compressed_async$macrocall$2$macrocall$1$macrocall$3", "symbols": ["compressed_async$macrocall$2$macrocall$3"]},
    {"name": "compressed_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "compressed_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_async$macrocall$2$macrocall$1$macrocall$3", "compressed_async$macrocall$2$macrocall$1$macrocall$2"]},
    {"name": "compressed_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "symbols": ["compressed_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1", "compressed_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_async$macrocall$2$macrocall$1$macrocall$1", "symbols": ["compressed_async$macrocall$2$macrocall$1$macrocall$2", "compressed_async$macrocall$2$macrocall$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_async$macrocall$2$macrocall$1", "symbols": ["compressed_async$macrocall$2$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "compressed_async$macrocall$2", "symbols": ["compressed_async$macrocall$2$macrocall$1"]},
    {"name": "compressed_async$macrocall$1", "symbols": ["_", "compressed_async$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_async", "symbols": ["compressed_async$macrocall$1"], "postprocess": ([throws]) => finaliseAsync(throws)},
    {"name": "compressed_async_toss", "symbols": ["digit"], "postprocess": ([value]) => ({ value })},
    {"name": "compressed_async_toss", "symbols": ["letter"], "postprocess": ([value]) => ({ value: numerify(value) })},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$2", "symbols": ["compressed_sync_toss"]},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$3", "symbols": []},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$1", "symbols": ["compressed_sync$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_sync$macrocall$2$macrocall$2$macrocall$3", "compressed_sync$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["compressed_sync$macrocall$2$macrocall$2$macrocall$3", "compressed_sync$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "compressed_sync$macrocall$2$macrocall$2$macrocall$2", "compressed_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_sync$macrocall$2$macrocall$2", "symbols": ["compressed_sync$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "compressed_sync$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$2", "symbols": ["compressed_sync$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$3", "symbols": ["compressed_sync$macrocall$2$macrocall$3"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$1", "symbols": [{"literal":"("}, "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$2", "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$3", "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$2", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$1"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$5", "symbols": ["compressed_sync$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$6", "symbols": ["compressed_sync$macrocall$2$macrocall$3"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$4", "symbols": [{"literal":"("}, "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$5", "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$6", "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$5", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$2$macrocall$1$ebnf$1", "compressed_sync$macrocall$2$macrocall$1$ebnf$1$macrocall$4"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$2", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync$macrocall$2$macrocall$1", "symbols": ["compressed_sync$macrocall$2$macrocall$1$ebnf$1", "compressed_sync$macrocall$2$macrocall$1$ebnf$2"], "postprocess": ([actions, mirrored])   => mirrored ? mirror(actions) : actions},
    {"name": "compressed_sync$macrocall$2", "symbols": ["compressed_sync$macrocall$2$macrocall$1"]},
    {"name": "compressed_sync$macrocall$1", "symbols": ["_", "compressed_sync$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_sync", "symbols": ["compressed_sync$macrocall$1"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$2", "symbols": ["compressed_sync_toss"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$3", "symbols": []},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$1", "symbols": ["compressed_sync$macrocall$4$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_sync$macrocall$4$macrocall$2$macrocall$3", "compressed_sync$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["compressed_sync$macrocall$4$macrocall$2$macrocall$3", "compressed_sync$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$4$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "compressed_sync$macrocall$4$macrocall$2$macrocall$2", "compressed_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_sync$macrocall$4$macrocall$2", "symbols": ["compressed_sync$macrocall$4$macrocall$2$macrocall$1"]},
    {"name": "compressed_sync$macrocall$4$macrocall$3", "symbols": []},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$2", "symbols": ["compressed_sync$macrocall$4$macrocall$2"]},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$3", "symbols": ["compressed_sync$macrocall$4$macrocall$3"]},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$1", "symbols": [{"literal":"("}, "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$2", "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$3", "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$2", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$1"]},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$5", "symbols": ["compressed_sync$macrocall$4$macrocall$2"]},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$6", "symbols": ["compressed_sync$macrocall$4$macrocall$3"]},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$4", "symbols": [{"literal":"("}, "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$5", "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$6", "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$5", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$4$macrocall$1$ebnf$1", "compressed_sync$macrocall$4$macrocall$1$ebnf$1$macrocall$4"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$2", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "compressed_sync$macrocall$4$macrocall$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync$macrocall$4$macrocall$1", "symbols": ["compressed_sync$macrocall$4$macrocall$1$ebnf$1", "compressed_sync$macrocall$4$macrocall$1$ebnf$2"], "postprocess": ([actions, mirrored])   => mirrored ? mirror(actions) : actions},
    {"name": "compressed_sync$macrocall$4", "symbols": ["compressed_sync$macrocall$4$macrocall$1"]},
    {"name": "compressed_sync$macrocall$3", "symbols": ["_", "compressed_sync$macrocall$4", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_sync", "symbols": ["compressed_sync$macrocall$3"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "compressed_sync_toss$ebnf$1", "symbols": ["cross"], "postprocess": id},
    {"name": "compressed_sync_toss$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync_toss", "symbols": ["digit_even", "compressed_sync_toss$ebnf$1"], "postprocess": ([value, cross]) => ({ value,                  cross: !!cross })},
    {"name": "compressed_sync_toss$ebnf$2", "symbols": ["cross"], "postprocess": id},
    {"name": "compressed_sync_toss$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync_toss", "symbols": ["letter_even", "compressed_sync_toss$ebnf$2"], "postprocess": ([value, cross]) => ({ value: numerify(value), cross: !!cross })}
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

const notations = {

   "standard:async": declaration,
   "standard:sync": declaration$1,
   "standard": ["standard:async", "standard:sync"],
   "compressed:async": declaration$2,
   "compressed:sync": declaration$3,
   "compressed": ["compressed:async", "compressed:sync"]

};

function parse( string, notations$$1 ){

   // Flatten composite notations ("standard" to "standard:async" and "standard:sync").
   notations$$1 = notations$$1.reduce( (r, n) => r.concat(Array.isArray(notations[n]) ? notations[n] : n), [] );

   if( notations$$1.some(notation => typeof notation !== "string" || !notations[notation]) )
      throw new Error("Unsupported notation.");

   // The throws can be passed directly to avoid parsing siteswaps that derived
   // from others by manipulating their .throws.
   if( typeof string === "object" ){
      if( !validOutput(string) || notations$$1.length > 1 )
         throw new Error("Invalid input.");
      return { notation: notations$$1[0], throws: string };
   }

   // When passed a string, try parsing with passed notations, returning the 
   // first successful result.
   for( const notation of notations$$1 ){
      const [throws] = notations[notation].parse(string);
      if( throws && validOutput(throws) )
         return { notation, throws };
   }

   throw new Error("Invalid syntax.");

}


function validOutput( throws ){
   
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

function toString( notation = this.notation ){

   if( !this.valid )
      throw new Error("Invalid siteswap.");

   if( !notations[notation] )
      throw new Error("Unsupported notation.");

   // Check if they're compatible.
   if( this.notation !== notation ){
      const limitsFrom = notations[this.notation].limits || {};
      const limitsTo = notations[notation].limits || {};
      const properties = Object.keys(limitsTo);

      if( properties.some(property => limitsTo[property].min > limitsFrom[property].max || limitsTo[property].max < limitsFrom[property].min) )
         throw new Error("Incompatible notations.");

      if( properties.some(property => this[property] > limitsTo[property].max || this[property] < limitsTo[property].min) )
         throw new Error("This siteswap can't be converted to the target notation.");
   }

   return notations[notation].unparse(this.throws);

}

// A juggle is either a siteswap or a transition between states. It 
// validates the throw and hand sequences' structure.

// Transitions don't do much at the moment (they only appear in
// `.composition`), their existence will be justified with graph
// and siteswap generation. Also transitioning between siteswaps.

class Juggle {
   
   constructor( string, notations = "compressed" ){

      try {

         const { throws, notation } = this.parse(string, [].concat(notations));
         const values = throws.reduce((result, action) => result.concat( ...action.map(release => release.map(({value}) => value)) ), []);

         this.notation      = notation;
         this.valid         = true;
         this.throws        = throws;
         this.degree        = throws[0].length;
         this.props         = values.reduce((sum, value) => sum + value, 0) / throws.length;
         this.multiplex     = throws.reduce((max, action) => Math.max( max, ...action.map(({length}) => length) ), 0);
         this.greatestValue = Math.max(...values);

      }
      catch(e){

         this.valid = false;
         this.notation = notations;
         this.error = e.message;

      }

   }

}

Juggle.prototype.parse = parse;
Juggle.prototype.toString = toString;

class Transition extends Juggle {

	constructor( input, notation, stateFrom, stateTo ){

	  super(input, notation);

	  if( !this.valid )
	     return this;

	  this.stateFrom = stateFrom;
	  this.stateTo = stateTo;

	}

}

function decompose( states, throws, notation ){

	const composition = [];

	let last = 0;
	for( let to = 1; to <= states.length; to++ ){

		for( let from = to - 1; from >= last; from-- ){
			if( states[to % states.length].equals(states[from]) ){
				if( from === 0 && to === states.length ){
					return [this];
				}

				if( from > last ){
					composition.push( new Transition(throws.slice(last, from), notation, states[last], states[from]) );
				}
				composition.push( new Siteswap(throws.slice(from, to), notation) );
				last = to;
				break;
			}
		}

	}

	if( last !== states.length ){
		composition.push( new Transition(throws.slice(last), notation) );
	}

	return composition;

}

function excitify(){
   
   return this.states.some( state => state.ground );

}

function alphabetic( degree ){

  const offset = "A".charCodeAt(0);
  const count = "Z".charCodeAt(0) - offset + 1;

  return range(degree).map( (hand, i) => range(Math.floor(i / count)).map(key => String.fromCharCode(offset + key % count)).concat(String.fromCharCode(offset + i % count)).join("") );
  
}

function range( n ){

  return [...Array(n).keys()];
  
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

class Siteswap extends Juggle {
   
   constructor( input, notations ){

      super(input, notations);

      if( !this.valid )
         return this;

      try{

         this.validate(this.throws);
         this.valid = true;

      }
      catch(e){

         // Unset properties set in `Juggle`.
         const keys = Object.keys(this);
         for( const key of keys )
            delete this[key];

         this.valid = false;
         this.notation = notations;
         this.error = e.message;
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

      this.states        = this.schedulise(this.throws, false);
      this.strictStates  = this.schedulise(this.throws, true);
      this.orbits        = this.orbitise(this.throws, this.notation);
      this.composition   = this.decompose(this.states, this.throws, this.notation);
      
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