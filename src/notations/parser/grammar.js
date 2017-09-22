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




import { alphabetic } from "../../alphabetic";


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
    {"name": "integer$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "integer$ebnf$1", "symbols": ["integer$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer", "symbols": [/[1-9]/, "integer$ebnf$1"], "postprocess": ([first, rest]) => Number([first, ...rest].join(""))},
    {"name": "integer_even", "symbols": [/[02468]/], "postprocess": ([match]) => Number(match)},
    {"name": "integer_even$ebnf$1", "symbols": []},
    {"name": "integer_even$ebnf$1", "symbols": ["integer_even$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer_even", "symbols": [/[1-9]/, "integer_even$ebnf$1", /[02468]/], "postprocess": ([first, rest, last]) => Number([first, ...rest, last].join(""))},
    {"name": "cross", "symbols": [{"literal":"x"}], "postprocess": () => true},
    {"name": "crosspass", "symbols": [{"literal":"p"}], "postprocess": () => true},
    {"name": "pass", "symbols": [{"literal":"p"}, "integer"], "postprocess": ([, target]) => target},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", {"literal":" "}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null},
    {"name": "standard_async$macrocall$2$macrocall$2", "symbols": ["standard_async_toss"]},
    {"name": "standard_async$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_async$macrocall$2$macrocall$1", "symbols": ["standard_async$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "standard_async$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$2$macrocall$3", "_", "standard_async$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_async$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_async$macrocall$2$macrocall$3", "_", "standard_async$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$2$macrocall$1$ebnf$1", "standard_async$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_async$macrocall$2$macrocall$2", "standard_async$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$2", "symbols": ["standard_async$macrocall$2$macrocall$1"]},
    {"name": "standard_async$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_async$macrocall$1$macrocall$2$macrocall$2", "symbols": ["standard_async$macrocall$2"]},
    {"name": "standard_async$macrocall$1$macrocall$2$macrocall$3", "symbols": ["standard_async$macrocall$3"]},
    {"name": "standard_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$1$macrocall$2$macrocall$3", "_", "standard_async$macrocall$1$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "standard_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$1$macrocall$2$macrocall$1", "symbols": ["standard_async$macrocall$1$macrocall$2$macrocall$2", "standard_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$1$macrocall$2", "symbols": ["standard_async$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "standard_async$macrocall$1$macrocall$1", "symbols": ["_", "standard_async$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_async$macrocall$1", "symbols": ["standard_async$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "standard_async", "symbols": ["standard_async$macrocall$1"], "postprocess": ([throws])  => finaliseAsync(throws)},
    {"name": "standard_async$macrocall$5$macrocall$2", "symbols": ["standard_async_toss"]},
    {"name": "standard_async$macrocall$5$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "standard_async$macrocall$5$macrocall$1", "symbols": ["standard_async$macrocall$5$macrocall$2"], "postprocess": id},
    {"name": "standard_async$macrocall$5$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$5$macrocall$3", "_", "standard_async$macrocall$5$macrocall$2"]},
    {"name": "standard_async$macrocall$5$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$5$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_async$macrocall$5$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_async$macrocall$5$macrocall$3", "_", "standard_async$macrocall$5$macrocall$2"]},
    {"name": "standard_async$macrocall$5$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$5$macrocall$1$ebnf$1", "standard_async$macrocall$5$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$5$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_async$macrocall$5$macrocall$2", "standard_async$macrocall$5$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$5", "symbols": ["standard_async$macrocall$5$macrocall$1"]},
    {"name": "standard_async$macrocall$6", "symbols": [{"literal":" "}]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$2", "symbols": ["standard_async$macrocall$5"]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$3", "symbols": ["standard_async$macrocall$6"]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_async$macrocall$4$macrocall$2$macrocall$3", "_", "standard_async$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_async$macrocall$4$macrocall$2$macrocall$1", "symbols": ["standard_async$macrocall$4$macrocall$2$macrocall$2", "standard_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_async$macrocall$4$macrocall$2", "symbols": ["standard_async$macrocall$4$macrocall$2$macrocall$1"]},
    {"name": "standard_async$macrocall$4$macrocall$1", "symbols": ["_", "standard_async$macrocall$4$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_async$macrocall$4", "symbols": ["standard_async$macrocall$4$macrocall$1"], "postprocess": id},
    {"name": "standard_async", "symbols": ["standard_async$macrocall$4"], "postprocess": ([throws])  => finaliseAsync(throws)},
    {"name": "standard_async_toss", "symbols": ["integer"], "postprocess": ([value]) => ({ value })},
    {"name": "standard_sync$macrocall$2$macrocall$2", "symbols": ["standard_sync_toss"]},
    {"name": "standard_sync$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_sync$macrocall$2$macrocall$1", "symbols": ["standard_sync$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "standard_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_sync$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$2$macrocall$2"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_sync$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$2$macrocall$2"]},
    {"name": "standard_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$2$macrocall$1$ebnf$1", "standard_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_sync$macrocall$2$macrocall$2", "standard_sync$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$2", "symbols": ["standard_sync$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "symbols": ["standard_sync$macrocall$2"]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "symbols": ["standard_sync$macrocall$3"]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "symbols": ["standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "symbols": ["_"]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2"]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "symbols": ["standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync$macrocall$1$macrocall$2$subexpression$1", "symbols": ["standard_sync$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "_", "standard_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1"]},
    {"name": "standard_sync$macrocall$1$macrocall$2", "symbols": ["standard_sync$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "standard_sync$macrocall$1$macrocall$1", "symbols": ["_", "standard_sync$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_sync$macrocall$1", "symbols": ["standard_sync$macrocall$1$macrocall$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "standard_sync", "symbols": ["standard_sync$macrocall$1"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "standard_sync$macrocall$5$macrocall$2", "symbols": ["standard_sync_toss"]},
    {"name": "standard_sync$macrocall$5$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "standard_sync$macrocall$5$macrocall$1", "symbols": ["standard_sync$macrocall$5$macrocall$2"], "postprocess": id},
    {"name": "standard_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "standard_sync$macrocall$5$macrocall$3", "_", "standard_sync$macrocall$5$macrocall$2"]},
    {"name": "standard_sync$macrocall$5$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "standard_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "standard_sync$macrocall$5$macrocall$3", "_", "standard_sync$macrocall$5$macrocall$2"]},
    {"name": "standard_sync$macrocall$5$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$5$macrocall$1$ebnf$1", "standard_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$5$macrocall$1", "symbols": [{"literal":"["}, "_", "standard_sync$macrocall$5$macrocall$2", "standard_sync$macrocall$5$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$5", "symbols": ["standard_sync$macrocall$5$macrocall$1"]},
    {"name": "standard_sync$macrocall$6", "symbols": [{"literal":" "}]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "symbols": ["standard_sync$macrocall$5"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "symbols": ["standard_sync$macrocall$6"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "_", "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2", "symbols": ["standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2$macrocall$1"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$3", "symbols": ["_"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$3", "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2"]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": ["standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1", "symbols": ["standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$2", "standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync$macrocall$4$macrocall$2$subexpression$1", "symbols": ["standard_sync$macrocall$4$macrocall$2$subexpression$1$macrocall$1", "_", "standard_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1"]},
    {"name": "standard_sync$macrocall$4$macrocall$2", "symbols": ["standard_sync$macrocall$4$macrocall$2$subexpression$1"]},
    {"name": "standard_sync$macrocall$4$macrocall$1", "symbols": ["_", "standard_sync$macrocall$4$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "standard_sync$macrocall$4", "symbols": ["standard_sync$macrocall$4$macrocall$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "standard_sync", "symbols": ["standard_sync$macrocall$4"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "standard_sync_toss$ebnf$1", "symbols": ["cross"], "postprocess": id},
    {"name": "standard_sync_toss$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "standard_sync_toss", "symbols": ["integer_even", "standard_sync_toss$ebnf$1"], "postprocess": ([value, cross]) => ({ value, cross: !!cross })},
    {"name": "compressed_async$macrocall$2$macrocall$2", "symbols": ["compressed_async_toss"]},
    {"name": "compressed_async$macrocall$2$macrocall$3", "symbols": []},
    {"name": "compressed_async$macrocall$2$macrocall$1", "symbols": ["compressed_async$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "compressed_async$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_async$macrocall$2$macrocall$3", "compressed_async$macrocall$2$macrocall$2"]},
    {"name": "compressed_async$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_async$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "compressed_async$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["compressed_async$macrocall$2$macrocall$3", "compressed_async$macrocall$2$macrocall$2"]},
    {"name": "compressed_async$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_async$macrocall$2$macrocall$1$ebnf$1", "compressed_async$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_async$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "compressed_async$macrocall$2$macrocall$2", "compressed_async$macrocall$2$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_async$macrocall$2", "symbols": ["compressed_async$macrocall$2$macrocall$1"]},
    {"name": "compressed_async$macrocall$3", "symbols": []},
    {"name": "compressed_async$macrocall$1$macrocall$2$macrocall$2", "symbols": ["compressed_async$macrocall$2"]},
    {"name": "compressed_async$macrocall$1$macrocall$2$macrocall$3", "symbols": ["compressed_async$macrocall$3"]},
    {"name": "compressed_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "compressed_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_async$macrocall$1$macrocall$2$macrocall$3", "compressed_async$macrocall$1$macrocall$2$macrocall$2"]},
    {"name": "compressed_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "compressed_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_async$macrocall$1$macrocall$2$macrocall$1", "symbols": ["compressed_async$macrocall$1$macrocall$2$macrocall$2", "compressed_async$macrocall$1$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_async$macrocall$1$macrocall$2", "symbols": ["compressed_async$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "compressed_async$macrocall$1$macrocall$1", "symbols": ["_", "compressed_async$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_async$macrocall$1", "symbols": ["compressed_async$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "compressed_async", "symbols": ["compressed_async$macrocall$1"], "postprocess": ([throws]) => finaliseAsync(throws)},
    {"name": "compressed_async_toss", "symbols": ["digit"], "postprocess": ([value]) => ({ value })},
    {"name": "compressed_async_toss", "symbols": ["letter"], "postprocess": ([value]) => ({ value: numerify(value) })},
    {"name": "compressed_sync$macrocall$2$macrocall$2", "symbols": ["compressed_sync_toss"]},
    {"name": "compressed_sync$macrocall$2$macrocall$3", "symbols": []},
    {"name": "compressed_sync$macrocall$2$macrocall$1", "symbols": ["compressed_sync$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_sync$macrocall$2$macrocall$3", "compressed_sync$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["compressed_sync$macrocall$2$macrocall$3", "compressed_sync$macrocall$2$macrocall$2"]},
    {"name": "compressed_sync$macrocall$2$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$2$macrocall$1$ebnf$1", "compressed_sync$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "compressed_sync$macrocall$2$macrocall$2", "compressed_sync$macrocall$2$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_sync$macrocall$2", "symbols": ["compressed_sync$macrocall$2$macrocall$1"]},
    {"name": "compressed_sync$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$2", "symbols": ["compressed_sync$macrocall$2"]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$3", "symbols": ["compressed_sync$macrocall$3"]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$1", "symbols": [{"literal":"("}, "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$2", "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$3", "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$2", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": ["compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$1"]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$5", "symbols": ["compressed_sync$macrocall$2"]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$6", "symbols": ["compressed_sync$macrocall$3"]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$4", "symbols": [{"literal":"("}, "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$5", "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$6", "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$5", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": ["compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$macrocall$4"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$2", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync$macrocall$1$macrocall$2$subexpression$1", "symbols": ["compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "compressed_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$2"]},
    {"name": "compressed_sync$macrocall$1$macrocall$2", "symbols": ["compressed_sync$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "compressed_sync$macrocall$1$macrocall$1", "symbols": ["_", "compressed_sync$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_sync$macrocall$1", "symbols": ["compressed_sync$macrocall$1$macrocall$1"], "postprocess": ([[actions, mirrored]])   => mirrored ? mirror(actions) : actions},
    {"name": "compressed_sync", "symbols": ["compressed_sync$macrocall$1"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "compressed_sync$macrocall$5$macrocall$2", "symbols": ["compressed_sync_toss"]},
    {"name": "compressed_sync$macrocall$5$macrocall$3", "symbols": []},
    {"name": "compressed_sync$macrocall$5$macrocall$1", "symbols": ["compressed_sync$macrocall$5$macrocall$2"], "postprocess": id},
    {"name": "compressed_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$1", "symbols": ["compressed_sync$macrocall$5$macrocall$3", "compressed_sync$macrocall$5$macrocall$2"]},
    {"name": "compressed_sync$macrocall$5$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "compressed_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$2", "symbols": ["compressed_sync$macrocall$5$macrocall$3", "compressed_sync$macrocall$5$macrocall$2"]},
    {"name": "compressed_sync$macrocall$5$macrocall$1$ebnf$1", "symbols": ["compressed_sync$macrocall$5$macrocall$1$ebnf$1", "compressed_sync$macrocall$5$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$5$macrocall$1", "symbols": [{"literal":"["}, "compressed_sync$macrocall$5$macrocall$2", "compressed_sync$macrocall$5$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "compressed_sync$macrocall$5", "symbols": ["compressed_sync$macrocall$5$macrocall$1"]},
    {"name": "compressed_sync$macrocall$6", "symbols": []},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$2", "symbols": ["compressed_sync$macrocall$5"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$3", "symbols": ["compressed_sync$macrocall$6"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$1", "symbols": [{"literal":"("}, "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$2", "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$3", "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$2", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1", "symbols": ["compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$1"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$5", "symbols": ["compressed_sync$macrocall$5"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$6", "symbols": ["compressed_sync$macrocall$6"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$4", "symbols": [{"literal":"("}, "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$5", "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$6", "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$5", {"literal":")"}], "postprocess": ([, [[release1]], , [[release2]]]) => [release1, release2]},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1", "symbols": ["compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1", "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1$macrocall$4"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$2", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync$macrocall$4$macrocall$2$subexpression$1", "symbols": ["compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$1", "compressed_sync$macrocall$4$macrocall$2$subexpression$1$ebnf$2"]},
    {"name": "compressed_sync$macrocall$4$macrocall$2", "symbols": ["compressed_sync$macrocall$4$macrocall$2$subexpression$1"]},
    {"name": "compressed_sync$macrocall$4$macrocall$1", "symbols": ["_", "compressed_sync$macrocall$4$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "compressed_sync$macrocall$4", "symbols": ["compressed_sync$macrocall$4$macrocall$1"], "postprocess": ([[actions, mirrored]])   => mirrored ? mirror(actions) : actions},
    {"name": "compressed_sync", "symbols": ["compressed_sync$macrocall$4"], "postprocess": ([throws]) => finaliseSync(throws)},
    {"name": "compressed_sync_toss$ebnf$1", "symbols": ["cross"], "postprocess": id},
    {"name": "compressed_sync_toss$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync_toss", "symbols": ["digit_even", "compressed_sync_toss$ebnf$1"], "postprocess": ([value, cross]) => ({ value,                  cross: !!cross })},
    {"name": "compressed_sync_toss$ebnf$2", "symbols": ["cross"], "postprocess": id},
    {"name": "compressed_sync_toss$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "compressed_sync_toss", "symbols": ["letter_even", "compressed_sync_toss$ebnf$2"], "postprocess": ([value, cross]) => ({ value: numerify(value), cross: !!cross })},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$2$macrocall$2", "symbols": ["pass"]},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$2$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer", "passing_async$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$2$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$2$macrocall$2$macrocall$3", "_", "passing_async$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_async$macrocall$2$macrocall$2$macrocall$3", "_", "passing_async$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_async$macrocall$2$macrocall$2$macrocall$2", "passing_async$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$3", "symbols": ["passing_async$macrocall$2$macrocall$3"]},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$3", "_", "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$2", "passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$2", "symbols": ["passing_async$macrocall$2$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$2$macrocall$1$macrocall$1", "symbols": ["_", "passing_async$macrocall$2$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$2$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "passing_async$macrocall$2", "symbols": ["passing_async$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$1", "symbols": [{"literal":"|"}, "passing_async$macrocall$2"]},
    {"name": "passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$2", "symbols": [{"literal":"|"}, "passing_async$macrocall$2"]},
    {"name": "passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$1$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_async$macrocall$2", "passing_async$macrocall$1$macrocall$2$subexpression$1$ebnf$1", {"literal":">"}]},
    {"name": "passing_async$macrocall$1$macrocall$2", "symbols": ["passing_async$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "passing_async$macrocall$1$macrocall$1", "symbols": ["_", "passing_async$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$1", "symbols": ["passing_async$macrocall$1$macrocall$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_async", "symbols": ["passing_async$macrocall$1"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$2$macrocall$2", "symbols": ["pass"]},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$4$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer", "passing_async$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$4$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$4$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$4$macrocall$2$macrocall$3", "_", "passing_async$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_async$macrocall$4$macrocall$2$macrocall$3", "_", "passing_async$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$4$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_async$macrocall$4$macrocall$2$macrocall$2", "passing_async$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$4$macrocall$2", "symbols": ["passing_async$macrocall$4$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$4$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$4$macrocall$2"]},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$3", "symbols": ["passing_async$macrocall$4$macrocall$3"]},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$3", "_", "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$2", "passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$2", "symbols": ["passing_async$macrocall$4$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$4$macrocall$1$macrocall$1", "symbols": ["_", "passing_async$macrocall$4$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$4$macrocall$1", "symbols": ["passing_async$macrocall$4$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "passing_async$macrocall$4", "symbols": ["passing_async$macrocall$4$macrocall$1"]},
    {"name": "passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$1", "symbols": [{"literal":"|"}, "passing_async$macrocall$4"]},
    {"name": "passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$2", "symbols": [{"literal":"|"}, "passing_async$macrocall$4"]},
    {"name": "passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1", "passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$3$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_async$macrocall$4", "passing_async$macrocall$3$macrocall$2$subexpression$1$ebnf$1", {"literal":">"}]},
    {"name": "passing_async$macrocall$3$macrocall$2", "symbols": ["passing_async$macrocall$3$macrocall$2$subexpression$1"]},
    {"name": "passing_async$macrocall$3$macrocall$1", "symbols": ["_", "passing_async$macrocall$3$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$3", "symbols": ["passing_async$macrocall$3$macrocall$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_async", "symbols": ["passing_async$macrocall$3"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$2$macrocall$2", "symbols": ["crosspass"]},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$6$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer", "passing_async$macrocall$6$macrocall$2$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$6$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$6$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$6$macrocall$2$macrocall$3", "_", "passing_async$macrocall$6$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_async$macrocall$6$macrocall$2$macrocall$3", "_", "passing_async$macrocall$6$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$6$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_async$macrocall$6$macrocall$2$macrocall$2", "passing_async$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$6$macrocall$2", "symbols": ["passing_async$macrocall$6$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$6$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$6$macrocall$2"]},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$3", "symbols": ["passing_async$macrocall$6$macrocall$3"]},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$3", "_", "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$2", "passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$2", "symbols": ["passing_async$macrocall$6$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$6$macrocall$1$macrocall$1", "symbols": ["_", "passing_async$macrocall$6$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$6$macrocall$1", "symbols": ["passing_async$macrocall$6$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "passing_async$macrocall$6", "symbols": ["passing_async$macrocall$6$macrocall$1"]},
    {"name": "passing_async$macrocall$5$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_async$macrocall$6", {"literal":"|"}, "passing_async$macrocall$6", {"literal":">"}]},
    {"name": "passing_async$macrocall$5$macrocall$2", "symbols": ["passing_async$macrocall$5$macrocall$2$subexpression$1"]},
    {"name": "passing_async$macrocall$5$macrocall$1", "symbols": ["_", "passing_async$macrocall$5$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$5", "symbols": ["passing_async$macrocall$5$macrocall$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_async", "symbols": ["passing_async$macrocall$5"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$2$macrocall$2", "symbols": ["crosspass"]},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$8$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer", "passing_async$macrocall$8$macrocall$2$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([value, pass]) => ({ value, pass: pass ? pass[0] : false })},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$8$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$8$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$8$macrocall$2$macrocall$3", "_", "passing_async$macrocall$8$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_async$macrocall$8$macrocall$2$macrocall$3", "_", "passing_async$macrocall$8$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$8$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_async$macrocall$8$macrocall$2$macrocall$2", "passing_async$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$8$macrocall$2", "symbols": ["passing_async$macrocall$8$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$8$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$2", "symbols": ["passing_async$macrocall$8$macrocall$2"]},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$3", "symbols": ["passing_async$macrocall$8$macrocall$3"]},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$3", "_", "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$2"]},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1$ebnf$1", "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1", "symbols": ["passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$2", "passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$2", "symbols": ["passing_async$macrocall$8$macrocall$1$macrocall$2$macrocall$1"]},
    {"name": "passing_async$macrocall$8$macrocall$1$macrocall$1", "symbols": ["_", "passing_async$macrocall$8$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$8$macrocall$1", "symbols": ["passing_async$macrocall$8$macrocall$1$macrocall$1"], "postprocess": id},
    {"name": "passing_async$macrocall$8", "symbols": ["passing_async$macrocall$8$macrocall$1"]},
    {"name": "passing_async$macrocall$7$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_async$macrocall$8", {"literal":"|"}, "passing_async$macrocall$8", {"literal":">"}]},
    {"name": "passing_async$macrocall$7$macrocall$2", "symbols": ["passing_async$macrocall$7$macrocall$2$subexpression$1"]},
    {"name": "passing_async$macrocall$7$macrocall$1", "symbols": ["_", "passing_async$macrocall$7$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_async$macrocall$7", "symbols": ["passing_async$macrocall$7$macrocall$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_async", "symbols": ["passing_async$macrocall$7"], "postprocess": ([siteswaps]) => finalisePassingAsync(siteswaps)},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$2", "symbols": ["pass"]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "symbols": ["cross"]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer_even", "passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1$macrocall$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$1", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_sync$macrocall$2$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_sync$macrocall$2$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_sync$macrocall$2$macrocall$2$macrocall$2", "passing_sync$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "symbols": ["passing_sync$macrocall$2$macrocall$3"]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "symbols": ["passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "symbols": ["_"]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2"]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "symbols": ["passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1", "symbols": ["passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "_", "passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1$ebnf$1"]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$2$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$2$macrocall$1$macrocall$1", "symbols": ["_", "passing_sync$macrocall$2$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$2$macrocall$1", "symbols": ["passing_sync$macrocall$2$macrocall$1$macrocall$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$macrocall$2", "symbols": ["passing_sync$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$1", "symbols": [{"literal":"|"}, "passing_sync$macrocall$2"]},
    {"name": "passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$2", "symbols": [{"literal":"|"}, "passing_sync$macrocall$2"]},
    {"name": "passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$1$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_sync$macrocall$2", "passing_sync$macrocall$1$macrocall$2$subexpression$1$ebnf$1", {"literal":">"}]},
    {"name": "passing_sync$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$1$macrocall$1", "symbols": ["_", "passing_sync$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$1", "symbols": ["passing_sync$macrocall$1$macrocall$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_sync", "symbols": ["passing_sync$macrocall$1"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$2", "symbols": ["pass"]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "symbols": ["cross"]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer_even", "passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1$macrocall$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$1", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_sync$macrocall$4$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_sync$macrocall$4$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$4$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_sync$macrocall$4$macrocall$2$macrocall$2", "passing_sync$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$4$macrocall$2", "symbols": ["passing_sync$macrocall$4$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$4$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$4$macrocall$2"]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "symbols": ["passing_sync$macrocall$4$macrocall$3"]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "symbols": ["passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "symbols": ["_"]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2"]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "symbols": ["passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1", "symbols": ["passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "_", "passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1$ebnf$1"]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$4$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$4$macrocall$1$macrocall$1", "symbols": ["_", "passing_sync$macrocall$4$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$4$macrocall$1", "symbols": ["passing_sync$macrocall$4$macrocall$1$macrocall$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$macrocall$4", "symbols": ["passing_sync$macrocall$4$macrocall$1"]},
    {"name": "passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$1", "symbols": [{"literal":"|"}, "passing_sync$macrocall$4"]},
    {"name": "passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$2", "symbols": [{"literal":"|"}, "passing_sync$macrocall$4"]},
    {"name": "passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1", "symbols": ["passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1", "passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$3$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_sync$macrocall$4", "passing_sync$macrocall$3$macrocall$2$subexpression$1$ebnf$1", {"literal":">"}]},
    {"name": "passing_sync$macrocall$3$macrocall$2", "symbols": ["passing_sync$macrocall$3$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$3$macrocall$1", "symbols": ["_", "passing_sync$macrocall$3$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$3", "symbols": ["passing_sync$macrocall$3$macrocall$1"], "postprocess": ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)]},
    {"name": "passing_sync", "symbols": ["passing_sync$macrocall$3"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$2", "symbols": ["crosspass"]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "symbols": ["cross"]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer_even", "passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1$macrocall$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$1", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_sync$macrocall$6$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$6$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_sync$macrocall$6$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$6$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$6$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_sync$macrocall$6$macrocall$2$macrocall$2", "passing_sync$macrocall$6$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$6$macrocall$2", "symbols": ["passing_sync$macrocall$6$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$6$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$6$macrocall$2"]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "symbols": ["passing_sync$macrocall$6$macrocall$3"]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "symbols": ["passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "symbols": ["_"]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2"]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "symbols": ["passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1", "symbols": ["passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "_", "passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1$ebnf$1"]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$6$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$6$macrocall$1$macrocall$1", "symbols": ["_", "passing_sync$macrocall$6$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$6$macrocall$1", "symbols": ["passing_sync$macrocall$6$macrocall$1$macrocall$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$macrocall$6", "symbols": ["passing_sync$macrocall$6$macrocall$1"]},
    {"name": "passing_sync$macrocall$5$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_sync$macrocall$6", {"literal":"|"}, "passing_sync$macrocall$6", {"literal":">"}]},
    {"name": "passing_sync$macrocall$5$macrocall$2", "symbols": ["passing_sync$macrocall$5$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$5$macrocall$1", "symbols": ["_", "passing_sync$macrocall$5$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$5", "symbols": ["passing_sync$macrocall$5$macrocall$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_sync", "symbols": ["passing_sync$macrocall$5"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$2", "symbols": ["crosspass"]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "symbols": ["cross"]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": [], "postprocess": ()             => [false, false]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[match]])    => [match, false]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[match]])    => [false, match]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$2", "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$3"], "postprocess": ([[m1], [m2]]) => [m1, m2]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$1", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$3", "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$2"], "postprocess": ([[m1], [m2]]) => [m2, m1]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1", "symbols": ["integer_even", "passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1$macrocall$1"], "postprocess": ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross })},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$1", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "passing_sync$macrocall$8$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$8$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "passing_sync$macrocall$8$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$8$macrocall$2$macrocall$2"]},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$8$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "passing_sync$macrocall$8$macrocall$2$macrocall$2", "passing_sync$macrocall$8$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$8$macrocall$2", "symbols": ["passing_sync$macrocall$8$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$8$macrocall$3", "symbols": [{"literal":" "}]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "symbols": ["passing_sync$macrocall$8$macrocall$2"]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "symbols": ["passing_sync$macrocall$8$macrocall$3"]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1", "symbols": [{"literal":"("}, "_", "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$3", "_", "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$2", "_", {"literal":")"}], "postprocess": ([, , [[release1]], , , , [[release2]]]) => [release1, release2]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "symbols": ["passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2$macrocall$1"]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "symbols": ["_"]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1", "symbols": ["passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$3", "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2"]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "symbols": ["passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1", "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "symbols": ["passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$2", "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1", "symbols": ["passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$macrocall$1", "_", "passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1$ebnf$1"]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$2", "symbols": ["passing_sync$macrocall$8$macrocall$1$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$8$macrocall$1$macrocall$1", "symbols": ["_", "passing_sync$macrocall$8$macrocall$1$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$8$macrocall$1", "symbols": ["passing_sync$macrocall$8$macrocall$1$macrocall$1"], "postprocess": ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions},
    {"name": "passing_sync$macrocall$8", "symbols": ["passing_sync$macrocall$8$macrocall$1"]},
    {"name": "passing_sync$macrocall$7$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}, "passing_sync$macrocall$8", {"literal":"|"}, "passing_sync$macrocall$8", {"literal":">"}]},
    {"name": "passing_sync$macrocall$7$macrocall$2", "symbols": ["passing_sync$macrocall$7$macrocall$2$subexpression$1"]},
    {"name": "passing_sync$macrocall$7$macrocall$1", "symbols": ["_", "passing_sync$macrocall$7$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "passing_sync$macrocall$7", "symbols": ["passing_sync$macrocall$7$macrocall$1"], "postprocess": ([[, [first], , [second]]]) => [first, second]},
    {"name": "passing_sync", "symbols": ["passing_sync$macrocall$7"], "postprocess": ([siteswaps]) => finalisePassingSync(siteswaps)},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$2", "symbols": ["multihand_toss_alpha"]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1", "symbols": ["multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$3", "_", "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$3", "_", "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$2", "multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$2", "symbols": ["multihand$macrocall$2$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$3", "symbols": [{"literal":","}]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "multihand$macrocall$2$macrocall$2$macrocall$3", "_", "multihand$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "multihand$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$macrocall$2$macrocall$2$macrocall$1", "symbols": ["multihand$macrocall$2$macrocall$2$macrocall$2", "multihand$macrocall$2$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$macrocall$2$macrocall$2", "symbols": ["multihand$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "multihand$macrocall$2$macrocall$3", "symbols": [{"literal":"\n"}]},
    {"name": "multihand$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "multihand$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "multihand$macrocall$2$macrocall$3", "_", "multihand$macrocall$2$macrocall$2"]},
    {"name": "multihand$macrocall$2$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$2$macrocall$1$ebnf$1", "multihand$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$macrocall$2$macrocall$1", "symbols": ["multihand$macrocall$2$macrocall$2", "multihand$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$macrocall$2", "symbols": ["multihand$macrocall$2$macrocall$1"]},
    {"name": "multihand$macrocall$1", "symbols": ["_", "multihand$macrocall$2", "_"], "postprocess": ([, [match]]) => match},
    {"name": "multihand", "symbols": ["multihand$macrocall$1"], "postprocess": ([throws]) => finaliseMultihand(throws)},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$2", "symbols": ["multihand_toss_num"]},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$3", "symbols": []},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1", "symbols": ["multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$2"], "postprocess": id},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$3", "_", "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$1"]},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2", "symbols": ["_", "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$3", "_", "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$2"]},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1", "symbols": [{"literal":"["}, "_", "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$2", "multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1$ebnf$1", "_", {"literal":"]"}], "postprocess": ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$2", "symbols": ["multihand$macrocall$4$macrocall$2$macrocall$2$macrocall$1"]},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$3", "symbols": []},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": []},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "multihand$macrocall$4$macrocall$2$macrocall$3", "_", "multihand$macrocall$4$macrocall$2$macrocall$2"]},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$4$macrocall$2$macrocall$1$ebnf$1", "multihand$macrocall$4$macrocall$2$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$macrocall$4$macrocall$2$macrocall$1", "symbols": ["multihand$macrocall$4$macrocall$2$macrocall$2", "multihand$macrocall$4$macrocall$2$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$macrocall$4$macrocall$2", "symbols": ["multihand$macrocall$4$macrocall$2$macrocall$1"]},
    {"name": "multihand$macrocall$4$macrocall$3", "symbols": [{"literal":"\n"}]},
    {"name": "multihand$macrocall$4$macrocall$1$ebnf$1", "symbols": []},
    {"name": "multihand$macrocall$4$macrocall$1$ebnf$1$subexpression$1", "symbols": ["_", "multihand$macrocall$4$macrocall$3", "_", "multihand$macrocall$4$macrocall$2"]},
    {"name": "multihand$macrocall$4$macrocall$1$ebnf$1", "symbols": ["multihand$macrocall$4$macrocall$1$ebnf$1", "multihand$macrocall$4$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "multihand$macrocall$4$macrocall$1", "symbols": ["multihand$macrocall$4$macrocall$2", "multihand$macrocall$4$macrocall$1$ebnf$1"], "postprocess": ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)]},
    {"name": "multihand$macrocall$4", "symbols": ["multihand$macrocall$4$macrocall$1"]},
    {"name": "multihand$macrocall$3", "symbols": ["_", "multihand$macrocall$4", "_"], "postprocess": ([, [match]]) => match},
    {"name": "multihand", "symbols": ["multihand$macrocall$3"], "postprocess": ([throws]) => finaliseMultihand(throws)},
    {"name": "multihand_toss_alpha", "symbols": ["letter_capital", "integer"], "postprocess": ([hand, value]) => ({ value, hand })},
    {"name": "multihand_toss_num$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "multihand_toss_num$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "multihand_toss_num", "symbols": [{"literal":"("}, "_", "multihand_toss_num$ebnf$1", "integer", "_", {"literal":","}, "_", "integer", "_", {"literal":")"}], "postprocess": ([, , minus, hand, , , , value]) => ({ value, offset: hand * (minus ? -1 : 1) })}
]
  , ParserStart: "digit"
}
export { grammar };
