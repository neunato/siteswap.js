
class SiteswapError extends Error {

   constructor( message ){

      super(message)

   }

}

SiteswapError.prototype.name = "SiteswapError"


export { SiteswapError }