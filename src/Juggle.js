
import { parse }          from "./Juggle.parse";
import { validateHands }  from "./Juggle.validateHands";
import { validateThrows } from "./Juggle.validateThrows";
import { mirrorThrows }   from "./Juggle.mirrorThrows";
import { stringify }      from "./Juggle.stringify";


// A juggle is either a siteswap or a transition between states. It 
// validates the throw and hand sequences' structure. If legacy mode,
// it assigns default hands and mirrors the throw sequence (after
// structure validation).

// Transitions don't do much at the moment (they only appear in
// `.composition`), their existence will be justified once the
// graph and generation come to life. They are also expected to
// be used for connecting siteswaps (going from one to another).

class Juggle {
   
   constructor( input, legacy ){

      this.input = input;

      try{

         let siteswap;
         let hands;
         let mirrored = false;

         // Input is string: separate hands from siteswap.
         if( typeof input === "string" ){
            [ siteswap, hands ] = input.split(":").reverse();
            if( hands )
               hands = hands.replace(" ", "").split(",");
         }
         // Input is object: hands and siteswap are separated.
         else if( typeof input === "object" && input.siteswap ){
            [ siteswap, hands ] = [ input.siteswap, input.hands ];
         }
         else{
            throw new Error("Invalid input.");
         }


         // Legacy adjustments slightly complicate things.
         if( legacy ){

            if( !hands ){
               if( typeof siteswap === "string" ) 
                  hands = siteswap.includes("(") ? ["l", "r"] : ["l"];
               else
                  hands = siteswap[0].length === 2 ? ["l", "r"] : ["l"];
            }

            if( hands.length > 2 ){
               throw new Error("Legacy mode supports at most two hands.");
            }

            const mirror = /\* *$/;
            if( typeof siteswap === "string" && mirror.test(siteswap) ){
               siteswap = siteswap.replace(mirror, "");
               mirrored = true;
            }

         }

         // Parse and validate throws and hands.
         this.validateHands(hands);

         const throws = typeof siteswap === "string" ? this.parse(siteswap, hands, legacy) : siteswap;

         this.validateThrows(throws);

         // Mirror throws after they're parsed, if needed.
         if( mirrored )
            this.mirrorThrows(throws);


         const values = throws.reduce((result, action) => Array.prototype.concat.apply(result, action.map(release => release.map(toss => toss.value))), []);
         
         // Assign properties.
         this.hands         = hands;
         this.throws        = throws;
         this.valid         = true;
         this.degree        = hands.length;
         this.props         = values.reduce((sum, value) => sum + value, 0) / this.throws.length;
         this.multiplex     = throws.reduce( (max, action) => Math.max.apply(null, [max, ...action.map(release => release.length)]), 0 );
         this.greatestValue = Math.max.apply(null, values);
         this.string        = this.stringify(this.throws, this.hands);

      }
      catch(e){

         this.valid = false;
         this.message = e.message;

      }

   }

}

Juggle.prototype.parse = parse;
Juggle.prototype.validateHands = validateHands;
Juggle.prototype.validateThrows = validateThrows;
Juggle.prototype.mirrorThrows = mirrorThrows;
Juggle.prototype.stringify = stringify;

export { Juggle };