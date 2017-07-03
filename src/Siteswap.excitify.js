
import { State } from "./State";


function excitify(){
   
   return this.states.some( state => state.ground );

}

export { excitify };