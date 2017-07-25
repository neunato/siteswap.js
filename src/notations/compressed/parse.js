// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(x) {return x[0]; }


import { Toss } from "../../Toss.js";

function mirror( throws ){

   return throws.concat( throws.map( action => action.map( release => release.map(({ value, crossing }) => ({ value, crossing })) ).reverse() ));

}

function finalise( throws ){
  
   return throws.map( action => action.map((release, i) => release.map(toss => new Toss(toss.value, i, toss.crossing ? 1 - i : i))) );

}




function numerify( letter ){

  if( letter < "a" )
    return letter.charCodeAt(0) - "A".charCodeAt(0) + 36;
  else
    return letter.charCodeAt(0) - "a".charCodeAt(0) + 10;

}

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "siteswap", "symbols": ["siteswap_a"], "postprocess": data => finalise(data[0])},
    {"name": "siteswap", "symbols": ["siteswap_s"], "postprocess": data => finalise(data[0])},
    {"name": "siteswap_a$ebnf$1", "symbols": ["action_a"]},
    {"name": "siteswap_a$ebnf$1", "symbols": ["siteswap_a$ebnf$1", "action_a"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "siteswap_a", "symbols": ["siteswap_a$ebnf$1"], "postprocess": id},
    {"name": "action_a", "symbols": ["release_a"]},
    {"name": "release_a", "symbols": ["toss_a"]},
    {"name": "release_a$ebnf$1", "symbols": ["toss_a"]},
    {"name": "release_a$ebnf$1", "symbols": ["release_a$ebnf$1", "toss_a"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "release_a", "symbols": [{"literal":"["}, "toss_a", "release_a$ebnf$1", {"literal":"]"}], "postprocess": data => [data[1], ...data[2]]},
    {"name": "toss_a", "symbols": ["digit_a"], "postprocess": data => ({ value: data[0] })},
    {"name": "toss_a", "symbols": ["letter_a"], "postprocess": data => ({ value: data[0] })},
    {"name": "digit_a", "symbols": [/[0-9]/], "postprocess": data => Number(data[0])},
    {"name": "letter_a", "symbols": [/[a-zA-Z]/], "postprocess": data => numerify(data[0])},
    {"name": "siteswap_s$ebnf$1$macrocall$2", "symbols": [{"literal":","}]},
    {"name": "siteswap_s$ebnf$1$macrocall$1", "symbols": [{"literal":"("}, "release_s", "siteswap_s$ebnf$1$macrocall$2", "release_s", {"literal":")"}], "postprocess": data => [data[1], data[3]]},
    {"name": "siteswap_s$ebnf$1", "symbols": ["siteswap_s$ebnf$1$macrocall$1"]},
    {"name": "siteswap_s$ebnf$1$macrocall$4", "symbols": [{"literal":","}]},
    {"name": "siteswap_s$ebnf$1$macrocall$3", "symbols": [{"literal":"("}, "release_s", "siteswap_s$ebnf$1$macrocall$4", "release_s", {"literal":")"}], "postprocess": data => [data[1], data[3]]},
    {"name": "siteswap_s$ebnf$1", "symbols": ["siteswap_s$ebnf$1", "siteswap_s$ebnf$1$macrocall$3"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "siteswap_s$ebnf$2", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "siteswap_s$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "siteswap_s", "symbols": ["siteswap_s$ebnf$1", "siteswap_s$ebnf$2"], "postprocess": data => data[1] === null ? data[0] : mirror(data[0])},
    {"name": "siteswap_s$ebnf$3$macrocall$2", "symbols": []},
    {"name": "siteswap_s$ebnf$3$macrocall$1", "symbols": [{"literal":"("}, "release_s", "siteswap_s$ebnf$3$macrocall$2", "release_s", {"literal":")"}], "postprocess": data => [data[1], data[3]]},
    {"name": "siteswap_s$ebnf$3", "symbols": ["siteswap_s$ebnf$3$macrocall$1"]},
    {"name": "siteswap_s$ebnf$3$macrocall$4", "symbols": []},
    {"name": "siteswap_s$ebnf$3$macrocall$3", "symbols": [{"literal":"("}, "release_s", "siteswap_s$ebnf$3$macrocall$4", "release_s", {"literal":")"}], "postprocess": data => [data[1], data[3]]},
    {"name": "siteswap_s$ebnf$3", "symbols": ["siteswap_s$ebnf$3", "siteswap_s$ebnf$3$macrocall$3"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "siteswap_s$ebnf$4", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "siteswap_s$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "siteswap_s", "symbols": ["siteswap_s$ebnf$3", "siteswap_s$ebnf$4"], "postprocess": data => data[1] === null ? data[0] : mirror(data[0])},
    {"name": "release_s", "symbols": ["toss_s"]},
    {"name": "release_s$ebnf$1", "symbols": ["toss_s"]},
    {"name": "release_s$ebnf$1", "symbols": ["release_s$ebnf$1", "toss_s"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "release_s", "symbols": [{"literal":"["}, "toss_s", "release_s$ebnf$1", {"literal":"]"}], "postprocess": data => [data[1], ...data[2]]},
    {"name": "toss_s$ebnf$1", "symbols": ["crossing"], "postprocess": id},
    {"name": "toss_s$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "toss_s", "symbols": ["digit_s", "toss_s$ebnf$1"], "postprocess": data => ({ value: data[0], crossing: data[1] !== null })},
    {"name": "toss_s$ebnf$2", "symbols": ["crossing"], "postprocess": id},
    {"name": "toss_s$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "toss_s", "symbols": ["letter_s", "toss_s$ebnf$2"], "postprocess": data => ({ value: data[0], crossing: data[1] !== null })},
    {"name": "digit_s", "symbols": [/[02468]/], "postprocess": data => Number(data[0]) / 2},
    {"name": "letter_s", "symbols": [/[acegikmoqsuwyACEGIKMOQSUWY]/], "postprocess": data => numerify(data[0]) / 2},
    {"name": "crossing", "symbols": [{"literal":"x"}], "postprocess": id}
]
  , ParserStart: "siteswap"
}
export { grammar };
