@include "src/notations/preprocessors.ne"


@{%

function numerify( letter ){

  if( letter < "a" )
    return letter.charCodeAt(0) - "A".charCodeAt(0) + 36;
  else
    return letter.charCodeAt(0) - "a".charCodeAt(0) + 10;

}

%}



siteswap           -> siteswap_a                                   {% data => finalise(data[0]) %}
                    | siteswap_s                                   {% data => finalise(data[0]) %}

# async

siteswap_a         -> action_a:+                                   {% id %}
action_a           -> release_a
release_a          -> toss_a
                    | "[" toss_a toss_a:+ "]"                      {% data => [data[1], ...data[2]] %}
toss_a             -> digit_a                                      {% data => ({ value: data[0] }) %}
                    | letter_a                                     {% data => ({ value: data[0] }) %}
digit_a            -> [0-9]                                        {% data => Number(data[0]) %}
letter_a           -> [a-zA-Z]                                     {% data => numerify(data[0]) %}

# sync

action_s[sep]      -> "(" release_s $sep release_s ")"             {% data => [data[1], data[3]] %}

siteswap_s         -> action_s[","]:+ "*":?                        {% data => data[1] === null ? data[0] : mirror(data[0]) %}
                    | action_s[null]:+ "*":?                       {% data => data[1] === null ? data[0] : mirror(data[0]) %}
release_s          -> toss_s
                    | "[" toss_s toss_s:+ "]"                      {% data => [data[1], ...data[2]] %}
toss_s             -> digit_s crossing:?                           {% data => ({ value: data[0], crossing: data[1] !== null }) %}
                    | letter_s crossing:?                          {% data => ({ value: data[0], crossing: data[1] !== null }) %}
digit_s            -> [02468]                                      {% data => Number(data[0]) / 2 %}
letter_s           -> [acegikmoqsuwyACEGIKMOQSUWY]                 {% data => numerify(data[0]) / 2 %}
crossing           -> "x"                                          {% id %}
