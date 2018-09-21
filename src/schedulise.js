
import { getInitialState } from "./graph"


function schedulise(siteswap) {

   const states = []
   const first = getInitialState(siteswap)
   let last = first
   do {
      for (const action of siteswap.throws) {
         states.push(last.schedule)
         last = last.advance(action)
      }
   } while (first !== last)
   return states

}


export { schedulise }
