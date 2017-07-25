@{%

import { Toss } from "../../Toss.js";

function mirror( throws ){

   return throws.concat( throws.map( action => action.map( release => release.map(({ value, crossing }) => ({ value, crossing })) ).reverse() ));

}

function finalise( throws ){
  
   return throws.map( action => action.map((release, i) => release.map(toss => new Toss(toss.value, i, toss.crossing ? 1 - i : i))) );

}

%}