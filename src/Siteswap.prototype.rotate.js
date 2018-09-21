
import { Siteswap }      from "./Siteswap"
import { SiteswapError } from "./SiteswapError"


function rotate(count = 1) {

   if (!this.valid)
      throw new SiteswapError("Invalid siteswap.")

   const { throws } = this

   if (count < 0)
      count = throws.length + (count % throws.length)

   return new Siteswap(throws.map((_, i) => throws[(i + count) % throws.length]), this.notation)

}


export { rotate }

