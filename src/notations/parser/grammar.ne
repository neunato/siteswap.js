
# Macros.

separated[e, sep]
   ->  $e ($sep $e):*                                      {% ([[first], rest]) => [first, ...rest.map(([,[toss]]) => toss)] %}

separated_[e, sep]
   ->  $e (_ $sep _ $e):*                                  {% ([[first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)] %}


release[toss, sep]
   ->  $toss                                               {% id %}
    |  "[" $toss ($sep $toss):+ "]"                        {% ([, [first], rest]) => [first, ...rest.map(([,[toss]]) => toss)] %}

release_[toss, sep]
   ->  $toss                                               {% id %}
    |  "[" _ $toss (_ $sep _ $toss):+ _ "]"                {% ([, , [first], rest]) => [first, ...rest.map(([,,,[toss]]) => toss)] %}


async[release, sep]
   ->  trim[separated[$release, $sep]]                     {% id %}

async_[release, sep]
   ->  trim[separated_[$release, $sep]]                    {% id %}


sync_action[release, sep]
   ->  "(" $release $sep $release ")"                      {% ([, [[release1]], , [[release2]]]) => [release1, release2] %}

sync_action_[release, sep]
   ->  "(" _ $release _ $sep _ $release _ ")"              {% ([, , [[release1]], , , , [[release2]]]) => [release1, release2] %}


sync[release, sep]
   ->  trim[(sync_action[$release, $sep]:+ "*":?)]                  {% ([[actions, mirrored]])   => mirrored ? mirror(actions) : actions %}

sync_[release, sep]
   ->  trim[(separated[sync_action_[$release, $sep], _] _ "*":?)]   {% ([[actions, , mirrored]]) => mirrored ? mirror(actions) : actions %}


passing_[siteswap]
   ->  trim[("<" $siteswap ("|" $siteswap):+ ">")]           {% ([[, [first], rest]]) => [first, ...rest.map(([,[match]]) => match)] %}

passing_two_[siteswap]
   ->  trim[("<" $siteswap "|" $siteswap ">")]               {% ([[, [first], , [second]]]) => [first, second] %}

passing_async_toss[pass]
   ->  integer $pass:?                                            {% ([value, pass]) => ({ value, pass: pass ? pass[0] : false }) %}

passing_sync_toss[pass]
   ->  integer_even extract[$pass, cross]                         {% ([value, [pass, cross]]) => ({ value, pass: pass ? pass[0] : false, cross }) %}






trim[e]
   ->  _ $e _                                              {% ([, [match]]) => match %}

extract[a, b]
   ->  null                                                {% ()             => [false, false] %}
    |  $a                                                  {% ([[match]])    => [match, false] %}
    |  $b                                                  {% ([[match]])    => [false, match] %}
    |  $a $b                                               {% ([[m1], [m2]]) => [m1, m2] %}
    |  $b $a                                               {% ([[m1], [m2]]) => [m2, m1] %}



# Tokens

digit
   ->  [0-9]                           {% ([match]) => Number(match) %}

digit_even
   ->  [02468]                         {% ([match]) => Number(match) %}

letter
   ->  [a-zA-Z]                        {% id %}

letter_capital
   ->  [A-Z]                           {% id %}

letter_even
   ->  [acegikmoqsuwyACEGIKMOQSUWY]    {% id %}

integer
   ->  [0-9]                           {% ([match]) => Number(match) %}
    |  [1-9] [0-9]:+                   {% ([first, rest]) => Number([first, ...rest].join("")) %}

integer_even
   ->  [02468]                         {% ([match]) => Number(match) %}
    |  [1-9] [0-9]:* [02468]           {% ([first, rest, last]) => Number([first, ...rest, last].join("")) %}

cross
   ->  "x"                             {% () => true %}

crosspass
   ->  "p"                             {% () => true %}

pass
   ->  "p" integer                     {% ([, target]) => target %}

_
   ->  " ":*                           {% () => null %}



# Grammars

standard_async
   ->  async_[release_[standard_async_toss, ","], ","]           {% ([throws])  => finaliseAsync(throws) %}
    |  async_[release_[standard_async_toss, " "], " "]           {% ([throws])  => finaliseAsync(throws) %}

standard_async_toss
   -> integer                                                    {% ([value]) => ({ value }) %}


standard_sync
   ->  sync_[release_[standard_sync_toss, ","], ","]             {% ([throws]) => finaliseSync(throws) %}
    |  sync_[release_[standard_sync_toss, " "], " "]             {% ([throws]) => finaliseSync(throws) %}

standard_sync_toss
   ->  integer_even cross:?                                      {% ([value, cross]) => ({ value, cross: !!cross }) %}


compressed_async
   ->  async[release[compressed_async_toss, null], null]         {% ([throws]) => finaliseAsync(throws) %}

compressed_async_toss
   ->  digit                                                     {% ([value]) => ({ value }) %}
    |  letter                                                    {% ([value]) => ({ value: numerify(value) }) %}


compressed_sync
   ->  sync[release[compressed_sync_toss, null], ","]            {% ([throws]) => finaliseSync(throws) %}
    |  sync[release[compressed_sync_toss, null], null]           {% ([throws]) => finaliseSync(throws) %}

compressed_sync_toss
   ->  digit_even cross:?                                        {% ([value, cross]) => ({ value,                  cross: !!cross }) %}
    |  letter_even cross:?                                       {% ([value, cross]) => ({ value: numerify(value), cross: !!cross }) %}


passing_async
   ->  passing_[async_[release_[passing_async_toss[pass], ","], ","]]            {% ([siteswaps]) => finalisePassingAsync(siteswaps) %}
    |  passing_[async_[release_[passing_async_toss[pass], " "], " "]]            {% ([siteswaps]) => finalisePassingAsync(siteswaps) %}
    |  passing_two_[async_[release_[passing_async_toss[crosspass], ","], ","]]   {% ([siteswaps]) => finalisePassingAsync(siteswaps) %}
    |  passing_two_[async_[release_[passing_async_toss[crosspass], " "], " "]]   {% ([siteswaps]) => finalisePassingAsync(siteswaps) %}

passing_sync
   ->  passing_[sync_[release_[passing_sync_toss[pass], ","], ","]]              {% ([siteswaps]) => finalisePassingSync(siteswaps) %}
    |  passing_[sync_[release_[passing_sync_toss[pass], " "], " "]]              {% ([siteswaps]) => finalisePassingSync(siteswaps) %}
    |  passing_two_[sync_[release_[passing_sync_toss[crosspass], ","], ","]]     {% ([siteswaps]) => finalisePassingSync(siteswaps) %}
    |  passing_two_[sync_[release_[passing_sync_toss[crosspass], " "], " "]]     {% ([siteswaps]) => finalisePassingSync(siteswaps) %}


multihand
   -> trim[separated_[separated_[release_[multihand_toss_alpha, ","], ","], "\n"]]     {% ([throws]) => finaliseMultihand(throws) %}
    | trim[separated_[separated_[release_[multihand_toss_num, null], null], "\n"]]     {% ([throws]) => finaliseMultihand(throws) %}

multihand_toss_alpha
   -> letter_capital integer                                     {% ([hand, value]) => ({ value, hand }) %}

multihand_toss_num
   -> "(" _ "-":? integer _ "," _ integer _ ")"                  {% ([, , minus, hand, , , , value]) => ({ value, offset: hand * (minus ? -1 : 1) }) %}



@{%

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




import { numeric } from "../../alphabetic";


function finaliseMultihand( rows ){

   const period = rows.map(({length}) => length).reduce(lcm);
   const throws = [];
   for( let i = 0; i < period; i++ ){
      const action = rows.map(row => row[i % row.length]).map(function(release, handFrom){
         return release.map(function({ value, hand, offset }){
            const handTo = offset !== undefined ? handFrom + offset : numeric(hand);
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

%}