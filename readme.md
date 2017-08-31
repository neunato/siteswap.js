# siteswap.js

Representation of a siteswap in JavaScript.

Validates a siteswap and sets its properties, such as the number of props used or coloured period. Determines the throw sequence, juggling states, orbits and composition of a siteswap.




## Usage

#### Siteswap( string, notation = "compressed" )

- `string` - siteswap string or throws array.
- `notation` - notation used to parse `string`. See [supported notations](#notations).

```javascript
new Siteswap("753")
new Siteswap("[43]14")
new Siteswap("(4 2x)*")
new Siteswap("(2x,4x")    // Invalid.
new Siteswap("(4,2x)")    // Invalid.
```

The following properties are assigned:


__`.valid`__ &raquo; boolean showing if the siteswap is valid.

__`.error`__ &raquo; error message set to invalid siteswaps.

__`.notation`__ &raquo; notation used to parse the siteswap.

__`.degree`__ &raquo; number of hands used per beat. 

__`.props`__ &raquo; number of props the pattern requires.

__`.multiplex`__ &raquo; greatest number of props released together from a single hand.

__`.greatestValue`__ &raquo; greatest throw value.

__`.period`__ &raquo; length of one cycle.

__`.fullPeriod`__ &raquo; length of one coloured cycle (one which distinguishes props).

__`.groundState`__ &raquo; boolean showing if the siteswap is ground state or excited.

__`.prime`__ &raquo; boolean showing if the siteswap is prime (cannot be decomposed).

__`.throws`__ &raquo; array of tosses like `{ handFrom: int, handTo: int, value: int }` three levels deep representing the throw sequence. `.throws[1][0][3]` is the fourth (multiplex) toss of the first hand during the second throw of the sequence.

__`.states`__ &raquo; array of states like `{ schedule: array, strict: bool, ground: bool }` where `.schedule` represents the number of props in a given hand. `.states[1].schedule[0][3]` is the number of props in the first hand during the fourth beat of the second state.

__`.strictStates`__ &raquo; array of states like `{ schedule: array, strict: bool, ground: bool }` where `.schedule` represents the positions of specific props within hands and beats. `.states[1].schedule[0][3][2]` is the id of the third ball in the first hand during the fourth beat of the second state.

__`.orbits`__ &raquo; array of siteswap's orbits which are themselves `Siteswap`s.

__`.composition`__ &raquo; array of prime `Siteswap`s and `Transition`s between them which the siteswap is consisted of.

__`.toString( notation )`__ &raquo; returns a string representing the siteswap in a given notation, defaulting to the one siteswap was parsed with.

__`.log()`__ &raquo; outputs all the siteswap properties in a human friendly form to console.

-----

Invalid siteswaps only have `.valid`, `.error`, and `.notation` properties set.


Example
```javascript
const siteswap = new Siteswap("753")
siteswap.valid                      // true
siteswap.input                      // "753"
siteswap.notation                   // "compressed"
siteswap.degree                     // 1
siteswap.props                      // 5
siteswap.multiplex                  // 1
siteswap.greatestValue              // 7
siteswap.period                     // 3
siteswap.fullPeriod                 // 12
siteswap.groundState                // true
siteswap.prime                      // true
siteswap.throws                     // [
                                    //  [[{ "value": 7, "handFrom": 0, "handTo": 0 }]],
                                    //  [[{ "value": 5, "handFrom": 0, "handTo": 0 }]],
                                    //  [[{ "value": 3, "handFrom": 0, "handTo": 0 }]]
                                    // ] 
siteswap.states                     // [
                                    //  [[1,1,1,1,1,0,0]],
                                    //  [[1,1,1,1,0,0,1]],
                                    //  [[1,1,1,0,1,1,0]]
                                    // ]
siteswap.strictStates               // [
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
siteswap.composition                // [this]
siteswap.orbits                     // [new Siteswap("750"), new Siteswap("003")]
siteswap.toString()                 // "753"
siteswap.toString("standard:async") // "7,5,3"

```




## Notations


___standard___ - shorthand for `["standard:async", "standard:sync"]`  

___standard:async___ - vanilla siteswap with multiplex support where

- throw values > 9 written as numbers: `11` is eleven ball cascade
- throw values are separated: `1,1` is one ball cascade

___standard:sync___ - synchronous siteswap with multiplex support where

- throw values are doubled: `(4,4)` is a four ball fountain
- throw values > 9 written as numbers: `(10x,10x)` is a ten ball wimpy pattern
- throw values are separated: `([4,4],4)`



___compressed___ - shorthand for `["compressed:async", "compressed:sync"]`

___compressed:async___ - vanilla siteswap with multiplex support where

- throw values > 9 written as alphabetical letters: `b` is eleven ball cascade
- throw values are not separated: `11` is one ball cascade

___compressed:sync___ - synchronous siteswap with multiplex support where

- throw values are doubled: `(4,4)` is a four ball fountain
- throw values > 9 written as numbers: `(10x,10x)` is a ten ball wimpy pattern
- multiplex throw values are not separated: `([44],4)`
- hands are optionally separated: `([44],4)` `([44]4)`


## To do

- Multi-hand notation support.
- Siteswap and transition generator.
- Custom hand rhythm. Like two hands in one handed patterns.
- Combining siteswaps of different degrees.

## License

MIT License



