
import { validate }     from "./Siteswap.validate";
import { truncate }     from "./Siteswap.truncate";
import { schedulise }   from "./Siteswap.schedulise";
import { orbitise }     from "./Siteswap.orbitise";
import { decompose }    from "./Siteswap.decompose";
import { parse }        from "./Siteswap.parse";
import { equals }       from "./Siteswap.equals";
import { rotate }       from "./Siteswap.rotate";
import { toString }     from "./Siteswap.toString";
import { log }          from "./Siteswap.log";


class Siteswap {
   
   constructor( string, notations = "compressed" ){

      try{
         const { throws, notation } = this.parse(string, [].concat(notations));
         this.validate(throws);
         this.truncate(throws);

         this.valid         = true;
         this.notation      = notation;
         this.throws        = throws;
      }
      catch(e){
         this.valid = false;
         this.notation = notations;
         this.error = e.message;
         return this;
      }      
      

      const values       = this.throws.reduce((result, action) => result.concat( ...action.map(release => release.map(({value}) => value)) ), []);

      this.degree        = this.throws[0].length;
      this.props         = values.reduce((sum, value) => sum + value) / this.throws.length;
      this.multiplex     = this.throws.reduce((max, action) => Math.max( max, ...action.map(({length}) => length) ), 0);
      this.greatestValue = Math.max(...values);

      this.states        = this.schedulise(this.throws, false);
      this.strictStates  = this.schedulise(this.throws, true);
      this.orbits        = this.orbitise(this.throws, this.notation);
      this.composition   = this.decompose(this.states, this.throws, this.notation);

      this.period        = this.states.length;
      this.fullPeriod    = this.strictStates.length;
      this.groundState   = this.states.some(({ground}) => ground);
      this.prime         = this.composition.length === 1;

   }

}


Siteswap.prototype.validate     = validate;
Siteswap.prototype.truncate     = truncate;
Siteswap.prototype.schedulise   = schedulise;
Siteswap.prototype.orbitise     = orbitise;
Siteswap.prototype.decompose    = decompose;
Siteswap.prototype.parse        = parse;
Siteswap.prototype.equals       = equals;
Siteswap.prototype.rotate       = rotate;
Siteswap.prototype.toString     = toString;
Siteswap.prototype.log          = log;

export { Siteswap };