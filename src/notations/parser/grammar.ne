
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
   ->  separated[$release, $sep]                           {% id %}

async_[release, sep]
   ->  separated_[$release, $sep]                          {% id %}


sync_action[release, sep]
   ->  "(" $release $sep $release ")"                      {% ([, [[release1]], , [[release2]]]) => [release1, release2] %}

sync_action_[release, sep]
   ->  "(" _ $release _ $sep _ $release _ ")"              {% ([, , [[release1]], , , , [[release2]]]) => [release1, release2] %}


sync[release, sep]
   ->  sync_action[$release, $sep]:+ "*":?                 {% ([actions, mirrored])   => mirrored ? mirror(actions) : actions %}

sync_[release, sep]
   ->  separated[sync_action_[$release, $sep], _] _ "*":?  {% ([actions, , mirrored]) => mirrored ? mirror(actions) : actions %}


trim[e]
   ->  _ $e _                                              {% ([, [match]]) => match %}



# Tokens

digit
   ->  [0-9]                           {% ([match]) => Number(match) %}

digit_even
   ->  [02468]                         {% ([match]) => Number(match) %}

letter
   ->  [a-zA-Z]                        {% id %}

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

_
   ->  " ":*                           {% () => null %}



# Grammars

standard_async
   ->  trim[async_[release_[standard_async_toss, ","], ","]]    {% ([throws])  => finaliseAsync(throws) %}
    |  trim[async_[release_[standard_async_toss, " "], " "]]    {% ([throws])  => finaliseAsync(throws) %}

standard_async_toss
   -> integer                                                   {% ([value]) => ({ value }) %}


standard_sync
   ->  trim[sync_[release_[standard_sync_toss, ","], ","]]      {% ([throws]) => finaliseSync(throws) %}
    |  trim[sync_[release_[standard_sync_toss, " "], " "]]      {% ([throws]) => finaliseSync(throws) %}

standard_sync_toss
   ->  integer_even cross:?                                     {% ([value, cross]) => ({ value: value, cross: !!cross }) %}


compressed_async
   ->  trim[async[release[compressed_async_toss, null], null]]  {% ([throws]) => finaliseAsync(throws) %}

compressed_async_toss
   ->  digit                                                    {% ([value]) => ({ value }) %}
    |  letter                                                   {% ([value]) => ({ value: numerify(value) }) %}


compressed_sync
   ->  trim[sync[release[compressed_sync_toss, null], ","]]     {% ([throws]) => finaliseSync(throws) %}
    |  trim[sync[release[compressed_sync_toss, null], null]]    {% ([throws]) => finaliseSync(throws) %}

compressed_sync_toss
   ->  digit_even cross:?                                       {% ([value, cross]) => ({ value,                  cross: !!cross }) %}
    |  letter_even cross:?                                      {% ([value, cross]) => ({ value: numerify(value), cross: !!cross }) %}




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

%}
