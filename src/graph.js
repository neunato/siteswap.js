
import { Siteswap } from "./Siteswap"


// All nodes (states) are stored in the same Map, regardless of number of props, degree, and length. All siteswaps  
// refer to the same `.schedule` arrays, stored on nodes.

// A state is accessed by providing the schedule. If the schedule already maps to a state, return that. If not, 
// check if the string representation of the schedule maps to a state, and return that. If neither works, store a 
// new `State` under the provided schedule and its string, and return it.

// A state can be accessed by providing a siteswap, whose initial state will be returned (and generated if it does 
// not exist).

// Nodes are currently only used to reuse their .schedules, but they are ready for links (transitions) and graph 
// traversals.

// Not sure how efficient all these lookups will be on large graphs.


const states = {
   schedules: new Map(),    // Schedule array to node map.
   strings: new Map()       // Schedule string to node map.
}

class State {
   
   constructor( schedule ){

      if( !Array.isArray(schedule) || !schedule.every(Array.isArray) )
         throw new Error("Invalid schedule.")

      // Schedule already used.
      let state = states.schedules.get(schedule)
      if( state )
         return state
      
      // Schedule not used, see if it's equivalent already found.
      const string = schedule.map(row => row.join(',')).join('-')
      state = states.strings.get(string)
      if( state )
         return state

      // New state.
      states.schedules.set(schedule, this)
      states.strings.set(string, this)

      this.schedule = schedule

   }

   advance( action ){

      const next = this.schedule.map(array => array.slice(1))

      for( let i = 0; i < action.length; i++ ){

         const release = action[i]

         // Check if toss distribution matches the beat's state.
         if( release.filter(({ value }) => value).length !== (this.schedule[i][0] || 0) )
            throw new Error("Invalid action.")

         if( !release.length )
            continue

         for( const { value, handTo, handFrom } of release ){
            if( value <= 0 )
               continue

            next[handTo][value - 1] = (next[handTo][value - 1] || 0) + 1

            for( let h = 0; h < next.length; h++ ){
               for( let k = this.schedule[0].length - 1; k < value; k++ )
                  if( !next[h][k] )
                     next[h][k] = 0;
            }

         }
      }

      return new State(next)

   }

}


function getInitialState( siteswap ){

   const schedule = []
   for( let i = 0; i < siteswap.degree; i++ )
      schedule.push( Array(siteswap.greatestValue).fill(0) )

   if( siteswap.greatestValue === 0 )
      return new State( schedule )

   const throws = siteswap.throws

   // The initial state is found by moving backwards in time and filling in
   // the balls until all are found.
   let props = 0

   for( let i = -1; true; i-- ){
      const action = throws[((i % throws.length) + throws.length) % throws.length]
      for( const release of action ){
         for( const toss of release ){
            const at = i + toss.value
            if( at < 0 )
               continue

            schedule[toss.handTo][at]++
            props++

            if( props === siteswap.props ){
               let length = siteswap.greatestValue
               while( schedule.every(row => row[length - 1] === 0) )
                  length--

               for( let j = 0; j < siteswap.degree; j++ )
                  schedule[j].length = length

               return new State( schedule )
            }
         }
      }
   }

}


export { getInitialState }


