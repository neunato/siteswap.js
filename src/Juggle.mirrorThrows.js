
import { Toss } from "./Toss";


function mirrorThrows( throws ){

   for( let i = 0, n = throws.length; i < n; i++ )
      throws.push( throws[i].map( release => release.map(toss => new Toss(toss.value, 1 - toss.handFrom, 1 - toss.handTo)) ).reverse() );

}

export { mirrorThrows };