
import { validate }           from "./validate";
import { truncate }           from "./truncate";
import { schedulise }         from "./schedulise";
import { scheduliseStrictly } from "./scheduliseStrictly";
import { orbitise }           from "./orbitise";
import { decompose }          from "./decompose";
import { parse }              from "./parse";
import { isGround }           from "./isGround";

import { equals }             from "./Siteswap.prototype.equals";
import { rotate }             from "./Siteswap.prototype.rotate";
import { toString }           from "./Siteswap.prototype.toString";
import { log }                from "./Siteswap.prototype.log";


class Siteswap {
   
   constructor( string, notations = "compressed" ){

      try{
         const { throws, notation } = parse(string, [].concat(notations));

         validate(throws);

         this.valid    = true;
         this.notation = notation;
         this.throws   = truncate(throws);
      }
      catch(e){
         this.valid = false;
         this.notation = notations;
         this.error = e.message;
         return this;
      }


      const throws       = this.throws;
      const values       = throws.reduce((result, action) => result.concat( ...action.map(release => release.map(({value}) => value)) ), []);

      this.degree        = throws[0].length;
      this.props         = values.reduce((sum, value) => sum + value) / throws.length;
      this.multiplex     = throws.reduce((max, action) => Math.max( max, ...action.map(({length}) => length) ), 0);
      this.greatestValue = Math.max(...values);

      this.states        = schedulise(this);
      this.strictStates  = scheduliseStrictly(this);
      this.orbits        = orbitise(this);
      this.composition   = decompose(this);

      this.period        = this.states.length;
      this.fullPeriod    = this.strictStates.length;
      this.prime         = this.composition.length === 1;
      this.groundState   = this.states.some(isGround);

   }

}

Siteswap.prototype.equals   = equals;
Siteswap.prototype.rotate   = rotate;
Siteswap.prototype.toString = toString;
Siteswap.prototype.log      = log;


export { Siteswap };