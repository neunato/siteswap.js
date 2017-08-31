
import { parse }          from "./Juggle.parse";
import { toString }      from "./Juggle.toString";


// A juggle is either a siteswap or a transition between states. It 
// validates the throw and hand sequences' structure.

// Transitions don't do much at the moment (they only appear in
// `.composition`), their existence will be justified with graph
// and siteswap generation. Also transitioning between siteswaps.

class Juggle {
   
   constructor( string, notations = "compressed" ){

      try {

         const { throws, notation } = this.parse(string, [].concat(notations));
         const values = throws.reduce((result, action) => result.concat( ...action.map(release => release.map(({value}) => value)) ), []);

         this.notation      = notation;
         this.valid         = true;
         this.throws        = throws;
         this.degree        = throws[0].length;
         this.props         = values.reduce((sum, value) => sum + value, 0) / throws.length;
         this.multiplex     = throws.reduce((max, action) => Math.max( max, ...action.map(({length}) => length) ), 0);
         this.greatestValue = Math.max(...values);

      }
      catch(e){

         this.valid = false;
         this.notation = notations;
         this.error = e.message;

      }

   }

}

Juggle.prototype.parse = parse;
Juggle.prototype.toString = toString;

export { Juggle };