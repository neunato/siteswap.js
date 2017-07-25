
import { parse }          from "./Juggle.parse";
import { validateThrows } from "./Juggle.validateThrows";
import { toString }      from "./Juggle.toString";


// A juggle is either a siteswap or a transition between states. It 
// validates the throw and hand sequences' structure. If legacy mode,
// it assigns default hands and mirrors the throw sequence (after
// structure validation).

// Transitions don't do much at the moment (they only appear in
// `.composition`), their existence will be justified once the
// graph and generation come to life. They are also expected to
// be used for connecting siteswaps (going from one to another).

class Juggle {
   
   constructor( input, notation = "compressed" ){

      this.input = input;
      this.notation = notation;

      try{

         const throws = typeof input === "string" ? this.parse(input, notation) : input;
         this.validateThrows(throws);

         const values = throws.reduce((result, action) => Array.prototype.concat.apply(result, action.map(release => release.map(toss => toss.value))), []);
         
         // Assign properties.
         this.throws        = throws;
         this.valid         = true;
         this.degree        = throws[0].length;
         this.props         = values.reduce((sum, value) => sum + value, 0) / throws.length;
         this.multiplex     = throws.reduce( (max, action) => Math.max.apply(null, [max, ...action.map(release => release.length)]), 0 );
         this.greatestValue = Math.max.apply(null, values);

      }
      catch(e){

         this.valid = false;
         this.message = e.message;

      }

   }

}

Juggle.prototype.parse = parse;
Juggle.prototype.validateThrows = validateThrows;
Juggle.prototype.toString = toString;

export { Juggle };