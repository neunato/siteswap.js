
@{%

function alphify( digit ){
  
  if( digit < 10 )
    return digit;

  if( digit < 36 )
    return String.fromCharCode("a".charCodeAt(0) + digit - 10);
  
  if( digit < 62 )
    return String.fromCharCode("A".charCodeAt(0) + digit - 36);
  
}

%}



array[el]          -> "[" $el ("," $el):* "]"                      {% data => [data[1][0], ...data[2].map(m => m[1][0])] %}


siteswap           -> siteswap_a                                   {% id %}
                    | siteswap_s                                   {% id %}
    
siteswap_a         -> array[action_a]                              {% data => data[0].join("") %}
siteswap_s         -> array[action_s]                              {% data => data[0].join("") %}

action_a           -> "[" release_a "]"                            {% data => data[1] %}
action_s           -> "[" release_s "," release_s "]"              {% data => "(" + data[1] + "," + data[3] + ")" %}

release_a          -> array[toss_a]                                {% data => data[0].length > 1 ? "[" + data[0].join("") + "]" : data[0][0] %}
release_s          -> array[toss_s]                                {% data => data[0].length > 1 ? "[" + data[0].join("") + "]" : data[0][0] %}

toss_a             -> "{\"value\":" value ",\"handFrom\":" hand_a ",\"handTo\":" hand_a "}" {% data => alphify(data[1]) %}
toss_s             -> "{\"value\":" value ",\"handFrom\":" hand_s ",\"handTo\":" hand_s "}" {% data => alphify(data[1] * 2) + (data[3] !== data[5] ? "x" : "") %}

hand_a             -> [0]                                          {% id %}
                    | "null"                                       {% id %}
hand_s             -> [0-1]                                        {% id %}
                    | "null"                                       {% id %}

value              -> [0-9]                                        {% data => Number(data[0]) %}
                    | [1-9] [0-9]:+                                {% data => Number(data[0] + data[1].join("")) %}
