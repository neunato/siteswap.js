
import { Siteswap }      from "./Siteswap"
import { SiteswapError } from "./SiteswapError"


function equals(siteswap) {

   if (!this.valid)
      throw new SiteswapError("Invalid siteswap.")

   if (!(siteswap instanceof Siteswap) || !siteswap.valid)
      return false

   const throws1 = this.throws
   const throws2 = siteswap.throws

   if (throws1.length !== throws2.length)
      return false

   for (let i = 0; i < throws1.length; i++) {
      if (match(throws1, throws2, i))
         return true
   }

   return false

}

function match(throws1, throws2, offset) {

   for (let i = 0; i < throws1.length; i++) {
      const o = (i + offset) % throws1.length

      if (throws1[o].length !== throws2[i].length)
         return false

      for (let j = 0; j < throws1[o].length; j++) {
         if (throws1[o][j].length !== throws2[i][j].length)
            return false

         for (let k = 0; k < throws1[o][j].length; k++) {
            const toss1 = throws1[o][j][k]
            const toss2 = throws2[i][j][k]

            if (toss1.value !== toss2.value || toss1.handFrom !== toss2.handFrom || toss1.handTo !== toss2.handTo)
               return false
         }
      }
   }

   return true

}


export { equals }

