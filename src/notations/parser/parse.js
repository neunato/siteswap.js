
import { Parser }  from "nearley";
import { grammar } from "./grammar";


function parse( rule, string ){
   
   try{
      return new Parser(grammar.ParserRules, rule).feed(string).results;
   }
   catch(e){
      return [];
   }

}


export { parse };