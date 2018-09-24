(function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.Siteswap=b()})(this,function(){"use strict";function a(a){if(!b(a))throw new SiteswapError("Invalid throws structure.");const c=a.map(a=>a.map(()=>0));for(let b=0;b<a.length;b++){const d=a[b];for(const e of d)for(const d of e)c[b][d.handFrom]++,c[(b+d.value)%a.length][d.handTo]--}if(c.some(a=>a.some(a=>0!==a)))throw new SiteswapError("Invalid siteswap.")}function b(a){if(!Array.isArray(a)||!a.length)return!1;for(const b of a){if(!Array.isArray(b)||b.length!==a[0].length)return!1;if(b.some(a=>!Array.isArray(a)||!a.every(({value:a,handFrom:c,handTo:d})=>void 0!==a&&void 0!==c&&void 0!==d&&c<b.length&&d<b.length)))return!1}return!0}function c(a,b){if(a.length!==b.length)return!1;for(let c=0;c<a.length;c++){const d=a[c],e=b[c];if(d.length!==e.length)return!1;for(let a=0;a<d.length;a++){const b=d[a],c=e[a];if(b.length!==c.length)return!1;for(let a=0;a<b.length;a++){const d=b[a],e=c[a];if(d.value!==e.value||d.handFrom!==e.handFrom||d.handTo!==e.handTo)return!1}}}return!0}function d(a){for(let b=1,d=L(a.length/2);b<=d;b++)if(0==a.length%b){const d=a.slice(0,b);for(let e=b;e<a.length;e+=b){const f=a.slice(e,e+b);if(!c(d,f))break;if(b+e===a.length)return a.length=b,a}}return a}function e(a){const b=[];for(let c=0;c<a.degree;c++)b.push(Array(a.greatestValue).fill(0));if(0===a.greatestValue)return new N(b);const{throws:c}=a;let d=0;for(let e=-1;;e--){const f=c[(e%c.length+c.length)%c.length];for(const c of f)for(const f of c){const c=e+f.value;if(!(0>c)&&(b[f.handTo][c]++,d++,d===a.props)){let c=a.greatestValue;for(;b.every(a=>0===a[c-1]);)c--;for(let d=0;d<a.degree;d++)b[d].length=c;return new N(b)}}}}function f(a){const b=[],c=e(a);let d=c;do for(const c of a.throws)b.push(d.schedule),d=d.advance(c);while(c!==d);return b}function g(a){const b=[],c=h(a.states[0]);let d=c;do for(const c of a.throws)b.push(d),d=i(d,c);while(!j(c,d));return b}function h(a){let b=0;return a.map(a=>a.map(a=>Array(a).fill().map(()=>++b)))}function i(a,b){const c=a.map(a=>a.slice(1).map(a=>[...a]));for(let d=0;d<b.length;d++){const e=b[d];if(e.length||!e.every(({value:a,handTo:b,handFrom:c})=>0===a&&b===d&&c===d))for(let b=0;b<e.length;b++){const d=e[b];if(0>=d.value)continue;const f=a[d.handFrom][0][b];for(let b=0;b<c.length;b++)for(let e=a[0].length-1;e<d.value;e++)c[b][e]||(c[b][e]=[]);c[d.handTo][d.value-1].push(f)}}return c}function j(a,b){if(a.length!==b.length)return!1;for(let c=0;c<a.length;c++){const d=a[c],e=b[c];if(d.length!==e.length)return!1;for(let a=0;a<d.length;a++){const b=d[a],c=e[a];if(b.length!==c.length)return!1;for(let a=0;a<b.length;a++)if(b[a]!==c[a])return!1}}return!0}function k(a,b,c,d,e){const f=c[d][e];for(const g of f){if(0===g.value)continue;const e=(d+g.value)%c.length;b[e][g.handTo]===a||(b[e][g.handTo]=a,k(a,b,c,e,g.handTo))}}function l(a){const{throws:b,notation:c}=a,d=[],e=b.map(a=>a.map(()=>null));for(let c=0;c<b.length;c++){const a=b[c];for(let f=0;f<a.length;f++){const g=a[f];if(null===e[c][f]&&(1!==g.length||0!==g[0].value)){const a=[];k(a,e,b,c,f),d.push(a)}}}if(1===d.length)return[a];for(let c=0;c<b.length;c++){const a=b[c];for(const b of d)b.push(a.map((a,d)=>e[c][d]===b?a:[{value:0,handFrom:d,handTo:d}]))}return d.map(a=>new Siteswap(a,c))}function m(a){const b=[],c=[...a.throws],d=[...a.states],{notation:e}=a;let f=0;for(let g=1;g<=d.length;g++)for(let h=g-1;h>=f;h--)if(d[g%d.length]===d[h]){if(0==h&&g===d.length)return b.length?(n(b,new Siteswap(c.slice(h,g),e)),b):[a];f==h?(n(b,new Siteswap(c.slice(h,g),e)),f=g):(n(b,new Siteswap(c.splice(h,g-h),e)),d.splice(h,g-h),g=f);break}return b}function n(a,b){a.every(a=>!a.equals(b))&&a.push(b)}function o(a){if("string"!=typeof a)throw new Error("Expected string.");const b=a.charCodeAt(0);if(65<=b&&90>=b)return 36+b-O.A;if(97<=b&&122>=b)return 10+b-O.a;throw new Error("Expected alphabetic letter in [a-Z] range.")}function p(a){if("number"!=typeof a)throw new Error("Expected number.");if(10<=a&&35>=a)return K(a+O.a-10);if(36<=a&&61>=a)return K(a+O.A-36);throw new Error("Expected number in [10-61] range.")}function q(a){if("string"!=typeof a)throw new Error("Expected string.");if(!/^[a-zA-Z]+$/.test(a))throw new Error("Expected alphabetic string.");return[...a].reduce((a,b,c,{length:d})=>a+(b.charCodeAt(0)-O.A+1)*26**(d-c-1),0)-1}function r(a){if("number"!=typeof a)throw new Error("Expected number.");if(0>a)throw new Error("Expected number in [0, \u221E) range.");a++;const b=[];for(;0<a;)b.push(K(O.A+(a-1)%26)),a=L((a-1)/26);return b.reverse().join("")}function s(a){return+a}function t(c,a){const b=J(c,a),d=Math.min(c,a);let e=b;for(;0!=e%d;)e+=b;return e}function u(a){return a.concat(a.map(a=>a.map(a=>[...a]).reverse()))}function v(a){for(const b of a)for(const a of b)for(let b=0;b<a.length;b++)a[b]={value:a[b],handFrom:0,handTo:0};return a}function w(a){for(const b of a)for(let a=0;a<b.length;a++){const c=b[a];for(let b=0;b<c.length;b++){const{value:d,cross:e}=c[b];c[b]={value:d/2,handFrom:a,handTo:e?1-a:a}}}return a}function x(a){const b=a.map(({length:a})=>a).reduce(t),c=[];for(let d=0;d<b;d++){const b=a.map(a=>a[d%a.length]).map((a,b)=>a.map(({value:a,hand:c,offset:d})=>{const e=void 0===d?c:b+d;return{value:a,handFrom:b,handTo:e}}));c.push(b)}return c}function y(a){const b=a.map(({length:a})=>a).reduce(t),c=[];for(let d=0;d<b;d++){const b=a.map(a=>a[d%a.length][0]).map((a,b)=>a.map(({value:a,pass:c})=>{!0===c&&(c=2-b);const d=null===c?b:c-1;return{value:a,handFrom:b,handTo:d}}));c.push(b)}return c}function z(a){const b=a.map(({length:a})=>a).reduce(t),c=[];for(let d=0;d<b;d++){const b=Array.prototype.concat(...a.map(a=>a[d%a.length])).map((a,b)=>a.map(({value:a,pass:c,cross:d})=>{!0===c&&(c=2-L(b/2));const e=(null===c?b:2*(c-1)+b%2)+(d?b%2?-1:1:0);return{value:a/2,handFrom:b,handTo:e}}));c.push(b)}return c}function A(a,b=null){if(null===b){const b={};return b.immutables=[],b.terminals=new Set,a=A(a,b),a.immutables=b.immutables,a.terminals=[...b.terminals],a}if(null===a)return a;if("string"==typeof a){if(!S[a])throw new Error("Parsing error.");return A(S[a],b)}if(Array.isArray(a))return{symbols:a.map(a=>A(a,b))};if(a.fixed&&!a.value&&b.immutables.push(a),a.tokenType)return b.terminals.add(a),a;if("object"!=typeof a)throw new Error("Parsing error.");if(a.symbol)a.symbol=A(a.symbol,b);else if(a.symbols)a.symbols=a.symbols.map(a=>A(a,b));else if(a.repeat)a.repeat=a.repeat.map(a=>A(a,b));else if(a.either)a.either=a.either.map(a=>A(a,b));else if(a.allow)a.either=[A(a.allow,b),null],delete a.allow;else throw new Error("Parsing error.");return a}function B(a,b){const c=new RegExp(a.sort((c,a)=>c.index-a.index).map(({regex:a})=>`(${a})`).join("|"),"y"),d=[];for(;c.lastIndex<b.length;){const e=c.exec(b);if(null===e)return null;const f=e.findIndex((a,b)=>b&&a);d.push({type:a[f-1].tokenType,value:e[f]})}return d}function C(a){let b;if(null===a)return null;if(a.tokenType){const c=U[V];if(!c||c.type!==a.tokenType)return T;if(a.fixed)if(!a.value)a.value=c.value;else if(c.value!==a.value)return T;b=c.value,V++}else if(a.symbol){if(b=C(a.symbol),b===T)return T;}else if(a.symbols){b=[];for(const c of a.symbols){const a=C(c);if(a===T)return T;b.push(a)}}else if(a.repeat){for(b=[];b.length<a.max;){const c=V,d=C({symbols:a.repeat});if(d===T){V=c;break}b.push(d)}if(b.length<a.min||b.length>a.max)return T}else if(a.either){for(const b of a.either){const c=V,d=C(b);if(d===T){V=c;continue}const{processor:e}=a;if(a.fixed)if(void 0===a.value)a.value=b;else if(b!==a.value)return T;return e?e(d):d}return T}return a.processor?a.processor(b):b}function D(a,b){if(!a||!S[a])throw new Error("Parsing error.");"function"==typeof S[a]&&(S[a]=A(S[a]()));const c=S[a];for(const d of c.immutables)delete d.value;if(V=0,U=B(c.terminals,b),!U||!U.length)return null;const d=C(c);return d===T||V!==U.length?null:d}function E(a){const b=a.map(({value:a,handFrom:b,handTo:c})=>{const d=b%2==c%2?"":"x",e=c===b||c===b+(b%2?-1:1)?"":`p${L(c/2)+1}`;return`${2*a}${d}${e}`}).join(",");return 1<a.length?`[${b}]`:b}function F(a,b){if(b=b.reduce((a,b)=>a.concat(Array.isArray(W[b])?W[b]:b),[]),"object"==typeof a){const[c]=b;if(("string"!=typeof c||!W[c])&&null!==c)throw new SiteswapError("Unsupported notation.");return{notation:c,throws:a}}if(b.some(a=>"string"!=typeof a||!W[a]))throw new SiteswapError("Unsupported notation.");for(const c of b){const b=W[c].parse(a);if(b)return{notation:c,throws:b}}throw new SiteswapError("Invalid syntax.")}function G(a){return a.every(a=>a.every((a,b,{length:c})=>1===a||0===a&&b===c-1))}function H(a,b,c){for(let d=0;d<a.length;d++){const e=(d+c)%a.length;if(a[e].length!==b[d].length)return!1;for(let c=0;c<a[e].length;c++){if(a[e][c].length!==b[d][c].length)return!1;for(let f=0;f<a[e][c].length;f++){const g=a[e][c][f],h=b[d][c][f];if(g.value!==h.value||g.handFrom!==h.handFrom||g.handTo!==h.handTo)return!1}}}return!0}function I(a,b){return"string"!=typeof a&&(a=a.toString()),b++,a.length>=b?a:`${Array(b-a.length).join(" ")}${a}`}var J=Math.max,K=String.fromCharCode,L=Math.floor;class SiteswapError extends Error{}SiteswapError.prototype.name="SiteswapError";const M={schedules:new Map,strings:new Map};class N{constructor(a){if(!Array.isArray(a)||!a.every(Array.isArray))throw new Error("Invalid schedule.");let b=M.schedules.get(a);if(b)return b;const c=a.map(a=>a.join(",")).join("-");return b=M.strings.get(c),b?b:void(M.schedules.set(a,this),M.strings.set(c,this),this.schedule=a)}advance(a){const b=this.schedule.map(a=>a.slice(1));for(let c=0;c<a.length;c++){const d=a[c];if(d.filter(({value:a})=>a).length!==(this.schedule[c][0]||0))throw new Error("Invalid action.");if(d.length)for(const{value:a,handTo:c}of d)if(!(0>=a)){b[c][a-1]=(b[c][a-1]||0)+1;for(let c=0;c<b.length;c++)for(let d=this.schedule[0].length-1;d<a;d++)b[c][d]||(b[c][d]=0)}}return new N(b)}}const O={a:97,A:65};let P=!0;const Q={ws(){return{allow:" "}},trim(a){const b=Q.ws();return{symbols:[b,a,b],processor:([,a])=>a}},separator(){if(P){const a=Q.ws();return{either:[{symbols:[a,",",a]}," "],fixed:!0}}return{either:[","," "],fixed:!0}},separated(a,b,c){return{symbols:[c,{repeat:[a,c],min:b-1,max:1/0}],processor:([a,[...b]])=>[a,...b.map(([,a])=>a)]}},release(a,b){const c=Q.separated(b,2,a);return{either:[{symbols:[a]},{symbols:["[",P?Q.trim(c):c,"]"],processor:([,a])=>a}]}},asyncSiteswap(a,b){return{symbol:Q.separated(b,1,Q.release(a,b)),processor:a=>a.map(a=>[a])}},syncSiteswap(a,b,c){const d=Q.ws(),e=Q.release(a,b);if(P){return{symbols:[Q.separated(d,1,{symbols:["(",d,e,c,e,d,")"],processor:([,,a,,b])=>[a,b]}),d,{allow:"*"}],processor:([a,,b])=>b?u(a):a}}else{return{symbols:[Q.separated(null,1,{symbols:["(",e,c,e,")"],processor:([,a,,b])=>[a,b]}),{allow:"*"}],processor:([a,b])=>b?u(a):a}}}},R=[{tokenType:"[",regex:"\\["},{tokenType:"]",regex:"\\]"},{tokenType:"(",regex:"\\("},{tokenType:")",regex:"\\)"},{tokenType:"<",regex:"<"},{tokenType:">",regex:">"},{tokenType:"\n",regex:"\n"},{tokenType:"|",regex:"\\|"},{tokenType:"-",regex:"-"},{tokenType:",",regex:","},{tokenType:" ",regex:" +"},{tokenType:"*",regex:"\\*"},{tokenType:"x",regex:"x",processor:()=>!0},{tokenType:"pN",regex:"p(?:[1-9][0-9]*|0)",processor:a=>s(a.slice(1))},{tokenType:"p",regex:"p",processor:()=>!0},{tokenType:"digit",regex:"[0-9]",processor:s},{tokenType:"digit_even",regex:"[02468]",processor:s},{tokenType:"letter",regex:"[a-zA-Z]",processor:o},{tokenType:"letter_even",regex:"[acegikmoqsuwyACEGIKMOQSUWY]",processor:o},{tokenType:"letter_capital",regex:"[A-Z]"},{tokenType:"integer",regex:"[1-9][0-9]*|[0-9]",processor:s},{tokenType:"integer_even",regex:"[1-9][0-9]*[02468]|[02468]",processor:s}],S={standard_async:()=>(P=!0,{symbol:Q.trim(Q.asyncSiteswap("integer",Q.separator())),processor:v}),compressed_async:()=>(P=!1,{symbol:Q.trim(Q.asyncSiteswap({either:["digit","letter"]},null)),processor:v}),standard_sync:()=>{P=!0;const a=Q.separator();return{symbol:Q.trim(Q.syncSiteswap({symbols:["integer_even",{allow:"x"}],processor:([a,b])=>({value:a,cross:!!b})},a,a)),processor:w}},compressed_sync:()=>{P=!1;const a={allow:Q.separator(),fixed:!0};return{symbol:Q.trim(Q.syncSiteswap({symbols:[{either:["digit_even","letter_even"]},{allow:"x"}],processor:([a,b])=>({value:a,cross:!!b})},null,a)),processor:w}},multihand:()=>{P=!0;const a=Q.ws(),b=Q.trim(","),c=Q.trim("\n");return{symbol:Q.trim({either:[Q.separated(c,1,Q.separated(b,1,Q.release({symbols:[{either:[{symbols:[{repeat:[{symbol:"letter_capital",fixed:!0,value:"A"}],min:1,max:1/0},{allow:["letter_capital"]}],processor:([a,b])=>b?[...a,b].join(""):a.join("")},"letter_capital"],processor:q},"integer"],processor:([a,b])=>({value:b,hand:a})},b))),Q.separated(c,1,Q.separated(a,1,Q.release({symbols:["(",a,{allow:"-"},"integer",a,",",a,"integer",a,")"],processor:([,,a,b,,,,c])=>({value:c,offset:a?-b:b})},a)))]}),processor:x}},passing_async:()=>{P=!0;const a=Q.trim(Q.asyncSiteswap({symbols:["integer",{allow:"p"}],processor:([a,b])=>({value:a,pass:b})},Q.separator())),b=Q.trim(Q.asyncSiteswap({symbols:["integer",{allow:"pN"}],processor:([a,b])=>({value:a,pass:b})},Q.separator()));return{symbol:Q.trim({either:[{symbols:["<",a,"|",a,">"],processor:([,a,,b])=>[a,b]},{symbols:["<",Q.separated("|",2,b),">"],processor:([,a])=>a}]}),processor:y}},passing_sync:()=>{P=!0;const a=Q.separator(),b=Q.separator(),c=Q.separator(),d=Q.separator(),e=Q.trim({either:[Q.syncSiteswap({symbols:["integer_even",{allow:"x"},{allow:"p"}],processor:([a,b,c])=>({value:a,pass:c,cross:b})},a,a),Q.syncSiteswap({symbols:["integer_even",{allow:"p"},{allow:"x"}],processor:([a,b,c])=>({value:a,pass:b,cross:c})},b,b)]}),f=Q.trim({either:[Q.syncSiteswap({symbols:["integer_even",{allow:"x"},{allow:"pN"}],processor:([a,b,c])=>({value:a,pass:c,cross:b})},c,c),Q.syncSiteswap({symbols:["integer_even",{allow:"pN"},{allow:"x"}],processor:([a,b,c])=>({value:a,pass:b,cross:c})},d,d)]});return{symbol:Q.trim({either:[{symbols:["<",e,"|",e,">"],processor:([,a,,b])=>[a,b]},{symbols:["<",Q.separated("|",2,f),">"],processor:([,a])=>a}]}),processor:z}}};for(let a=0;a<R.length;a++){const b=R[a];b.index=a,S[b.tokenType]=b}const T={ERROR:!0};let U,V=0;const W={"standard:async":{limits:{degree:{min:1,max:1}},hands:()=>["Hand"],parse:a=>D("standard_async",a),unparse:function(a){return a.map(([a])=>{const b=a.map(({value:a})=>a).join(",");return 1<a.length?`[${b}]`:b}).join(",")}},"standard:sync":{limits:{degree:{min:2,max:2}},hands:()=>["Left","Right"],parse:a=>D("standard_sync",a),unparse:function(a){return a.map(a=>{const b=a.map(a=>{const b=a.map(({value:a,handFrom:b,handTo:c})=>`${2*a}${b===c?"":"x"}`).join(",");return 1<a.length?`[${b}]`:b});return`(${b})`}).join("")}},standard:["standard:async","standard:sync"],"compressed:async":{limits:{degree:{min:1,max:1},greatestValue:{max:61}},hands:()=>["Hand"],parse:a=>D("compressed_async",a),unparse:function(a){return a.map(([a])=>{const b=a.map(({value:a})=>9<a?p(a):a).join("");return 1<a.length?`[${b}]`:b}).join("")}},"compressed:sync":{limits:{degree:{min:2,max:2},greatestValue:{max:61}},hands:()=>["Left","Right"],parse:a=>D("compressed_sync",a),unparse:function(a){return a.map(a=>{const b=a.map(a=>{const b=a.map(({value:a,handFrom:b,handTo:c})=>(a*=2,`${9<a?p(a):a}${b===c?"":"x"}`)).join("");return 1<a.length?`[${b}]`:b});return`(${b})`}).join("")}},compressed:["compressed:async","compressed:sync"],"passing:async":{limits:{degree:{min:2}},hands:a=>Array(a).fill().map((a,b)=>`juggler ${b+1}`),parse:a=>D("passing_async",a),unparse:function(a){const b=a[0].map((b,c)=>a.map(a=>{const b=a[c],d=b.map(({value:a,handFrom:b,handTo:c})=>`${a}${b===c?"":`p${c+1}`}`).join(",");return 1<b.length?`[${d}]`:d}).join(",")).join("|");return`<${b}>`}},"passing:sync":{limits:{degree:{min:4,step:2}},hands:a=>Array(a).fill().map((a,b)=>`juggler ${L(b/2)+1}, hand ${b%2+1}`),parse:a=>D("passing_sync",a),unparse:function(a){const b=[];for(let c=0,[{length:d}]=a;c<d;c+=2)b.push(a.map(a=>`(${E(a[c])},${E(a[c+1])})`).join(""));return`<${b.join("|")}>`}},passing:["passing:async","passing:sync"],multihand:{hands:a=>Array(a).fill().map((a,b)=>r(b)),parse:a=>D("multihand",a),unparse:function(a){return a[0].map((b,c)=>a.map(a=>{const b=a[c],d=b.map(({value:a,handTo:b})=>`${r(b)}${a}`).join(",");return 1===b.length?d:`[${d}]`}).join(",")).join("\n")}}};class Siteswap{constructor(b,c="compressed"){try{const{throws:e,notation:f}=F(b,[].concat(c));a(e),this.valid=!0,this.notation=f,this.throws=d(e)}catch(a){if(!(a instanceof SiteswapError))throw a;return this.valid=!1,this.input=[b,c],this.error=a.message,this}const{throws:e}=this,h=e.reduce((a,b)=>a.concat(...b.map(a=>a.map(({value:a})=>a))),[]);this.degree=e[0].length,this.props=h.reduce((a,b)=>a+b)/e.length,this.multiplex=e.reduce((a,b)=>J(a,...b.map(({length:a})=>a)),0),this.greatestValue=J(...h),this.states=f(this),this.strictStates=g(this),this.orbits=l(this),this.composition=m(this),this.period=this.states.length,this.fullPeriod=this.strictStates.length,this.prime=1===this.composition.length,this.groundState=this.states.some(G)}}return Siteswap.prototype.equals=function(a){if(!this.valid)throw new SiteswapError("Invalid siteswap.");if(!(a instanceof Siteswap)||!a.valid)return!1;const b=this.throws,c=a.throws;if(b.length!==c.length)return!1;for(let d=0;d<b.length;d++)if(H(b,c,d))return!0;return!1},Siteswap.prototype.rotate=function(a=1){if(!this.valid)throw new SiteswapError("Invalid siteswap.");const{throws:b}=this;return 0>a&&(a=b.length+a%b.length),new Siteswap(b.map((c,d)=>b[(d+a)%b.length]),this.notation)},Siteswap.prototype.toString=function(a=this.notation){if(!this.valid)throw new SiteswapError("Invalid siteswap.");if(null===a)return JSON.stringify(this.throws);if(!W[a]||Array.isArray(W[a]))throw new SiteswapError("Unsupported notation.");if(this.notation!==a){const b=W[this.notation].limits||{},c=W[a].limits||{},d=Object.keys(c);if(d.some(a=>void 0!==c[a]&&void 0!==b[a]&&(void 0!==c[a].min&&void 0!==b[a].max&&c[a].min>b[a].max||void 0!==c[a].max&&void 0!==b[a].min&&c[a].max<b[a].min)))throw new SiteswapError("Incompatible notations.");if(d.some(a=>c[a].max&&this[a]>c[a].max||c[a].min&&this[a]<c[a].min||0!=this[a]%(c[a].step||1)))throw new SiteswapError("This siteswap can't be converted to the target notation.")}return W[a].unparse(this.throws)},Siteswap.prototype.log=function(){if(!this.valid)return void console.log("Invalid siteswap.");const a=[];let b;if(a.push(`siteswap\n ${this.toString().replace(/\n/g,"\n ")}`),a.push(`notation\n ${this.notation}`),a.push(`degree\n ${this.degree}`),a.push(`props\n ${this.props}`),a.push(`period\n ${this.period}`),a.push(`full period\n ${this.fullPeriod}`),a.push(`multiplex\n ${this.multiplex}`),a.push(`prime\n ${this.prime}`),a.push(`ground state\n ${this.groundState}`),2<this.degree){b=Array(this.degree).fill().map((a,b)=>r(b)),a.push("hand labels");const c=W[this.notation].hands(this.degree),d=[];d.push(this.degree.toString().length+1),d.push(J(...c.map(({length:a})=>a))),d.push(J(...b.map(({length:a})=>a)));for(let e=0;e<this.degree;e++){const f=I(e+1,d[0]),g=I(b[e],d[2]),h=I(c[e],d[1]);a.push(`${f}| ${g}${"multihand"===this.notation?"":` (${h})`}`)}}{a.push("throw sequence");const c=[];for(const[a,d]of this.throws.entries()){const e=d.map(a=>{let c;return c=2>=this.degree?a.map(({value:a,handFrom:b,handTo:c})=>`${a}${b===c?"":"x"}`).join(","):a.map(({value:a,handTo:c})=>`${a}${b[c]}`).join(","),1===a.length?c:`[${c}]`});c.push([`${a+1}|`,...e])}const d=[];for(let a=0;a<c[0].length;a++)d.push(J(...c.map(b=>b[a].length+1)));a.push(...c.map(a=>a.map((a,b)=>I(a,d[b])).join("")))}{a.push("states");const b=this.period.toString().length+1;for(const[c,d]of this.states.entries())for(const[e,f]of d.entries())a.push(`${I(e?" ":c+1,b)}| [${f.join(",")}]`)}{a.push("strict states");const b=this.fullPeriod.toString().length+1;for(const[c,d]of this.strictStates.entries())for(const[e,f]of d.entries())a.push(`${I(e?"":c+1,b)}| [${f.map(a=>`[${a.length?a.join(","):"-"}]`).join(",")}]`)}{a.push("orbits");const b=this.orbits.length.toString().length+1;for(const[c,d]of this.orbits.entries())a.push(...d.toString().split("\n").map((a,d)=>`${I(d?"":c+1,b)}| ${a}`))}{a.push("composition");const b=this.composition.length.toString().length+1;for(const[c,d]of this.composition.entries())a.push(...d.toString().split("\n").map((a,d)=>`${I(d?"":c+1,b)}| ${a}`))}a.push(" "),console.log(a.join("\n"))},Siteswap});