
import { Siteswap } from "./Siteswap"


function decompose(siteswap) {

   const composition = []

   const throws = [...siteswap.throws]
   const states = [...siteswap.states]
   const { notation } = siteswap

   let last = 0
   for (let to = 1; to <= states.length; to++) {
      for (let from = to - 1; from >= last; from--) {
         if (states[to % states.length] !== states[from])
            continue

         // Prime siteswap.
         if (from === 0 && to === states.length) {
            if (!composition.length)
               return [siteswap]
            add(composition, new Siteswap(throws.slice(from, to), notation))
            return composition
         }

         // Composite siteswaps, no transition.
         if (last === from) {
            add(composition, new Siteswap(throws.slice(from, to), notation))
            last = to
         }
         else {
            // Composite siteswaps with transition.
            add(composition, new Siteswap(throws.splice(from, to - from), notation))
            states.splice(from, to - from)
            to = last
         }
         break
      }
   }

   return composition

}

function add(collection, siteswap) {

   if (collection.every((item) => !item.equals(siteswap)))
      collection.push(siteswap)

}


export { decompose }
