// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(x) {return x[0]; }


function alphify( digit ){
  
  if( digit < 10 )
    return digit;

  if( digit < 36 )
    return String.fromCharCode("a".charCodeAt(0) + digit - 10);
  
  if( digit < 62 )
    return String.fromCharCode("A".charCodeAt(0) + digit - 36);
  
}

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "siteswap", "symbols": ["siteswap_a"], "postprocess": id},
    {"name": "siteswap", "symbols": ["siteswap_s"], "postprocess": id},
    {"name": "siteswap_a$macrocall$2", "symbols": ["action_a"]},
    {"name": "siteswap_a$macrocall$1$ebnf$1", "symbols": []},
    {"name": "siteswap_a$macrocall$1$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "siteswap_a$macrocall$2"]},
    {"name": "siteswap_a$macrocall$1$ebnf$1", "symbols": ["siteswap_a$macrocall$1$ebnf$1", "siteswap_a$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "siteswap_a$macrocall$1", "symbols": [{"literal":"["}, "siteswap_a$macrocall$2", "siteswap_a$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": data => [data[1][0], ...data[2].map(m => m[1][0])]},
    {"name": "siteswap_a", "symbols": ["siteswap_a$macrocall$1"], "postprocess": data => data[0].join("")},
    {"name": "siteswap_s$macrocall$2", "symbols": ["action_s"]},
    {"name": "siteswap_s$macrocall$1$ebnf$1", "symbols": []},
    {"name": "siteswap_s$macrocall$1$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "siteswap_s$macrocall$2"]},
    {"name": "siteswap_s$macrocall$1$ebnf$1", "symbols": ["siteswap_s$macrocall$1$ebnf$1", "siteswap_s$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "siteswap_s$macrocall$1", "symbols": [{"literal":"["}, "siteswap_s$macrocall$2", "siteswap_s$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": data => [data[1][0], ...data[2].map(m => m[1][0])]},
    {"name": "siteswap_s", "symbols": ["siteswap_s$macrocall$1"], "postprocess": data => data[0].join("")},
    {"name": "action_a", "symbols": [{"literal":"["}, "release_a", {"literal":"]"}], "postprocess": data => data[1]},
    {"name": "action_s", "symbols": [{"literal":"["}, "release_s", {"literal":","}, "release_s", {"literal":"]"}], "postprocess": data => "(" + data[1] + "," + data[3] + ")"},
    {"name": "release_a$macrocall$2", "symbols": ["toss_a"]},
    {"name": "release_a$macrocall$1$ebnf$1", "symbols": []},
    {"name": "release_a$macrocall$1$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "release_a$macrocall$2"]},
    {"name": "release_a$macrocall$1$ebnf$1", "symbols": ["release_a$macrocall$1$ebnf$1", "release_a$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "release_a$macrocall$1", "symbols": [{"literal":"["}, "release_a$macrocall$2", "release_a$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": data => [data[1][0], ...data[2].map(m => m[1][0])]},
    {"name": "release_a", "symbols": ["release_a$macrocall$1"], "postprocess": data => data[0].length > 1 ? "[" + data[0].join("") + "]" : data[0][0]},
    {"name": "release_s$macrocall$2", "symbols": ["toss_s"]},
    {"name": "release_s$macrocall$1$ebnf$1", "symbols": []},
    {"name": "release_s$macrocall$1$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "release_s$macrocall$2"]},
    {"name": "release_s$macrocall$1$ebnf$1", "symbols": ["release_s$macrocall$1$ebnf$1", "release_s$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "release_s$macrocall$1", "symbols": [{"literal":"["}, "release_s$macrocall$2", "release_s$macrocall$1$ebnf$1", {"literal":"]"}], "postprocess": data => [data[1][0], ...data[2].map(m => m[1][0])]},
    {"name": "release_s", "symbols": ["release_s$macrocall$1"], "postprocess": data => data[0].length > 1 ? "[" + data[0].join("") + "]" : data[0][0]},
    {"name": "toss_a$string$1", "symbols": [{"literal":"{"}, {"literal":"\""}, {"literal":"v"}, {"literal":"a"}, {"literal":"l"}, {"literal":"u"}, {"literal":"e"}, {"literal":"\""}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "toss_a$string$2", "symbols": [{"literal":","}, {"literal":"\""}, {"literal":"h"}, {"literal":"a"}, {"literal":"n"}, {"literal":"d"}, {"literal":"F"}, {"literal":"r"}, {"literal":"o"}, {"literal":"m"}, {"literal":"\""}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "toss_a$string$3", "symbols": [{"literal":","}, {"literal":"\""}, {"literal":"h"}, {"literal":"a"}, {"literal":"n"}, {"literal":"d"}, {"literal":"T"}, {"literal":"o"}, {"literal":"\""}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "toss_a", "symbols": ["toss_a$string$1", "value", "toss_a$string$2", "hand_a", "toss_a$string$3", "hand_a", {"literal":"}"}], "postprocess": data => alphify(data[1])},
    {"name": "toss_s$string$1", "symbols": [{"literal":"{"}, {"literal":"\""}, {"literal":"v"}, {"literal":"a"}, {"literal":"l"}, {"literal":"u"}, {"literal":"e"}, {"literal":"\""}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "toss_s$string$2", "symbols": [{"literal":","}, {"literal":"\""}, {"literal":"h"}, {"literal":"a"}, {"literal":"n"}, {"literal":"d"}, {"literal":"F"}, {"literal":"r"}, {"literal":"o"}, {"literal":"m"}, {"literal":"\""}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "toss_s$string$3", "symbols": [{"literal":","}, {"literal":"\""}, {"literal":"h"}, {"literal":"a"}, {"literal":"n"}, {"literal":"d"}, {"literal":"T"}, {"literal":"o"}, {"literal":"\""}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "toss_s", "symbols": ["toss_s$string$1", "value", "toss_s$string$2", "hand_s", "toss_s$string$3", "hand_s", {"literal":"}"}], "postprocess": data => alphify(data[1] * 2) + (data[3] !== data[5] ? "x" : "")},
    {"name": "hand_a", "symbols": [/[0]/], "postprocess": id},
    {"name": "hand_a$string$1", "symbols": [{"literal":"n"}, {"literal":"u"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "hand_a", "symbols": ["hand_a$string$1"], "postprocess": id},
    {"name": "hand_s", "symbols": [/[0-1]/], "postprocess": id},
    {"name": "hand_s$string$1", "symbols": [{"literal":"n"}, {"literal":"u"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "hand_s", "symbols": ["hand_s$string$1"], "postprocess": id},
    {"name": "value", "symbols": [/[0-9]/], "postprocess": data => Number(data[0])},
    {"name": "value$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "value$ebnf$1", "symbols": ["value$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "value", "symbols": [/[1-9]/, "value$ebnf$1"], "postprocess": data => Number(data[0] + data[1].join(""))}
]
  , ParserStart: "siteswap"
}
export { grammar };
