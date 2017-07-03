# siteswap.js

Representation of a siteswap in JavaScript.

Validates a siteswap and determines its properties, such as the number of props used or coloured period. Determines the throw sequence, juggling states, orbits and composition of a siteswap.




## Usage

#### Siteswap( string, legacy = true )

- `string` - siteswap string in notation based on `legacy`.
- `legacy` - when `true`, input string is parsed using the "normal" siteswap notation instead of [extended](#extended-notation).


```javascript
new Siteswap("753");
new Siteswap("[43]14");
new Siteswap("(4 2x)*");
new Siteswap("(2x,4x");    // Invalid.
new Siteswap("(4,2x)");    // Invalid.

```

|Property       |Description
| ------------- | ------------------------------------------------------------------- |
|`valid`        |Boolean showing if siteswap is valid.
|`message`      |If invalid, this tells you why.
|`input`        |Constructor input string.
|`string`       |String representing the pattern. Not necessarily equal to constructor input string.
|`hands`        |Array of hand labels - strings of `[a-zA-Z]`.
|`degree`       |Number of hands throwing each beat. 
|`props`        |Number of props the pattern requires.
|`multiplex`    |Greatest number of multiplex tosses occurring at once.
|`greatestValue`|Greatest throw value.
|`period`       |Length of one cycle.
|`fullPeriod`   |Length of one coloured cycle (one which distinguishes balls).
|`groundState`  |Boolean showing if siteswap is ground state or excited.
|`prime`        |Boolean showing if siteswap is prime (cannot be decomposed).
|`throws`       |Array of `Throw`s like `{ handFrom, handTo, value }` three levels deep representing the throw sequence. `.throws[1][0][3]` is the fourth (multiplex) toss of the first hand during the second throw of the sequence.
|`states`       |Array of `State`s like `{ schedule, strict, ground }` where `.schedule` represents the number of balls in a given hand. `.states[1].schedule[0][3]` is the number of balls in the first hand during the fourth beat of the second state.
|`strictStates` |Array of `State`s like `{ schedule, strict, ground }` where `.schedule` represents the positions of specific balls within hands and beats. `.states[1].schedule[0][3][2]` is the id of the third ball in the first hand during the fourth beat of the second state.
|`orbits`       |Array of siteswap's orbits which are themselves `Siteswap`s.
|`composition`  |Array of prime `Siteswap`s and `Transition`s between them which the siteswap is consisted of.

Invalid siteswaps only have `.valid`, `.message` and `.input` properties set.

Example
```javascript
const siteswap = new Siteswap("753");
siteswap.valid;         // true
siteswap.input;         // "753"
siteswap.string;        // "7,5,3"
siteswap.hands;         // ["l"]
siteswap.degree;        // 1
siteswap.props;         // 5
siteswap.multiplex;     // 1
siteswap.greatestValue; // 7
siteswap.period;        // 3
siteswap.fullPeriod;    // 12
siteswap.groundState;   // true
siteswap.prime;         // true
siteswap.throws;        // [
                        //  [[{ "value": 7, "handFrom": 0, "handTo": 0 }]],
                        //  [[{ "value": 5, "handFrom": 0, "handTo": 0 }]],
                        //  [[{ "value": 3, "handFrom": 0, "handTo": 0 }]]
                        // ] 
siteswap.states;        // [
                        //  [[1,1,1,1,1,0,0]],
                        //  [[1,1,1,1,0,0,1]],
                        //  [[1,1,1,0,1,1,0]]
                        // ]
siteswap.strictStates   // [
                        //  [[[3],[4],[0],[1],[2],[],[]]],
                        //  [[[4],[0],[1],[2],[],[],[3]]],
                        //  [[[0],[1],[2],[],[4],[3],[]]],
                        //  [[[1],[2],[0],[4],[3],[],[]]],
                        //  [[[2],[0],[4],[3],[],[],[1]]],
                        //  [[[0],[4],[3],[],[2],[1],[]]],
                        //  [[[4],[3],[0],[2],[1],[],[]]],
                        //  [[[3],[0],[2],[1],[],[],[4]]],
                        //  [[[0],[2],[1],[],[3],[4],[]]],
                        //  [[[2],[1],[0],[3],[4],[],[]]],
                        //  [[[1],[0],[3],[4],[],[],[2]]],
                        //  [[[0],[3],[4],[],[1],[2],[]]]
                        // ]
siteswap.composition;   // [this]
siteswap.orbits;        // [new Siteswap("750"), new Siteswap("003")]

```


## To do

- Siteswap and transition generator; incorporate state graph with `State`, `Toss`, `Siteswap` and `Transition`.
- Custom hand rhythm (`.hands.length !== .degree`). For example using two hands in one handed patterns.
- Passing patterns support.


## Extended notation

While the commonly used siteswap notation, referred to as _legacy_ is supported, the program encodes juggling patterns in a generalised form, from hereinafter _extended_, which treats asynchronous and synchronous siteswaps as special cases (1-handed and 2-handed juggling, respectively).

Essentially, we're talking about multi-hand notation with a different syntax.

_Note: the syntax is experimental and is expected to change in near future._

-----

Rules

- a _siteswap_ is composed of _hands_ and _actions_ separated by `:`, where
   - _hands_ is a sequence of hand strings used, separated by `,`,
   - _actions_ are optionally separated by `,` or ` `

- an _action_ is composed of _releases_ (one per hand), which are
   - grouped within `(` and `)` when two or more hands are used,
   - optionally grouped within `(` and `)` when one hand is used,
   - optionally separated by `,` or ` `

- a _release_ (of a hand) is composed of _tosses_, which are
   - grouped within `[` and `]` when there are two or more tosses,
   - optionally grouped within `[` and `]` when there is one toss,
   - optionally separated by `,` or ` `

- a _toss_ specifies where (which hand) and when (which beat) the ball will be caught, by specifing
   - a throw value as an integer,
   - the target hand as a string, declared in _hands_ (optional when thrown to same hand)

Example

```javascript
"l,r: (2r,1l)([2r2l],2l)"    // would normally be written as "(4x,2x)([4x4],2x)"
```


Restrictions

- Hand sequence must be explicitly specified, and only specified hands may occur as target hands.
- The number of throws per beat (releases per action) must match the hand sequence length.
- Optional choices (like commas as toss separators) must be consistently applied throughout the string.

Notes

- Throw values are not multiplied by the number of throws per beat (e.g. legacy sync throw value of 6 is a 3).
- Throw values are not necessarily single digits (e.g. `60` represents a sixty ball fountain, `6,0` and `(6)(0)` three in one hand, and `06` would be invalid).
- Asynchronous patterns are performed by one hand.


Examples comparing extended and legacy notations

```javascript
"h: 5"                                             "5" 
"h: (5)"
"h: [5]"
"h: ([5])"
```

```javascript
"a,b: (3a2a)(2b3b)"                                "(6x,4)*"
"l,r: (3r 2)(2 3l)"                                "(6x,4)(4,6x)"
"left,right: ([3right][2right]),([2left][3left])"
```

```javascript
"h: 11 9 7 5 3 1"                                  "b97531"
"h: 11,9,7,5,3,1"                                  "11 9 7 5 3 1"
"h: [11][9][7][5][3][1]"
"h: (11)(9)(7)(5)(3)(1)"
"h: (11),(9),(7),(5),(3),(1)"
```

```javascript
"h: [3,3],3,3"                                     "[33]33"
"h: [3 3],3,3"
"h: [3,3][3][3]"
"h: ([3,3])(3)(3)"
```

```javascript
"h: 35"                                            "z"
```

```javascript
"h: 61"                                            "Z"
```

```javascript
"h: 62"                                            -
```

```javascript
"a,b,c: (3,3,3)"                                   -

```





## License

MIT License



