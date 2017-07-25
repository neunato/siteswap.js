@include "src/notations/preprocessors.ne"


separated[e, sep]  -> $e ($sep $e):*                               {% data => [data[0][0], ...data[1].map(m => m[1][0])] %}


siteswap           -> siteswap_a                                   {% data => finalise(data[0]) %}
                    | siteswap_s                                   {% data => finalise(data[0]) %}

# async

action_a[sep]      -> release_a[$sep]
release_a[sep]     -> toss_a
                    | "[" toss_a ($sep toss_a):+ "]"               {% data => [data[1], ...data[2].map(el => el[1])] %}
siteswap_a         -> separated[action_a[","], ","]                {% id %}
                    | separated[action_a[" "], " "]                {% id %}
toss_a             -> digit_a                                      {% data => ({ value: data[0] }) %}
digit_a            -> [0-9]                                        {% data => Number(data[0]) %}
                    | [1-9] [0-9]:+                                {% data => Number([data[0], ...data[1]].join("")) %}

# sync

action_s[sep]      -> "(" release_s[$sep] $sep release_s[$sep] ")" {% data => [data[1], data[3]] %}
release_s[sep]     -> toss_s
                    | "[" toss_s ($sep toss_s):+ "]"               {% data => [data[1], ...data[2].map(el => el[1])] %}
siteswap_s         -> action_s[","]:+ "*":?                        {% data => data[1] === null ? data[0] : mirror(data[0]) %}
                    | action_s[" "]:+ "*":?                        {% data => data[1] === null ? data[0] : mirror(data[0]) %}
toss_s             -> digit_s crossing:?                           {% data => ({ value: data[0], crossing: data[1] !== null }) %}
digit_s            -> [02468]                                      {% data => Number(data[0]) / 2 %}
                    | [2468] [02468]:+                             {% data => Number([data[0], ...data[1]].join("")) / 2 %}
crossing           -> "x"                                          {% id %}
