
import { Siteswap } from "./Siteswap";


function log(){

   if( !this.valid ){
      console.log("Invalid siteswap.");
      return;
   }


   const lines = [];

   lines.push("siteswap\n " + this.string);
   lines.push("props\n " + this.props);
   lines.push("period\n " + this.period);
   lines.push("hands\n " + this.degree);
   lines.push("multiplex\n " + this.multiplex);
   lines.push("full period\n " + this.fullPeriod);
   lines.push("prime\n " + this.prime);
   lines.push("ground state\n " + this.groundState);
   
   lines.push("throw sequence");
   this.throws.forEach( (action, i) => action.forEach((release, j) => lines.push(" " + (i + 1) + (this.degree === 1 ? "" : ", hand " + this.hands[(i + j) % this.degree]) + ": [" + release.map( toss => toss.value + (toss.value === 0 || this.degree === 1 ? "" : this.hands[toss.handTo]) ).join(",") + "]")) );

   lines.push("states");
   this.states.forEach( (state, i) => state.schedule.forEach((handState, j) => lines.push(" " + (i + 1) + (this.degree === 1 ? "" : ", hand " + this.hands[j]) + ": [" + handState.join(",") + "]")) );

   lines.push("strict states");
   this.strictStates.forEach( (state, i) => state.schedule.forEach((handState, j) => lines.push(" " + (i + 1) + (this.degree === 1 ? "" : ", hand " + this.hands[j]) + ": [" + handState.map(balls => "[" + (!balls.length ? "-" : balls.join(",")) + "]").join(",") + "]" )) );

   lines.push("orbits");
   this.orbits.forEach( (orbit, i) => lines.push(" " + (i + 1) + ": " + orbit.string) );

   lines.push("composition");
   this.composition.forEach( (prime, i) => lines.push( (prime instanceof Siteswap ? " siteswap: " : " transition: ") + prime.string) );

   lines.push(" ");

   console.log( lines.join("\n") );

}

export { log };