
import { notations }  from "./notations";
import { alphabetic } from "./alphabetic";


function log(){

   if( !this.valid ){
      console.log("Invalid siteswap.");
      return;
   }

   const lines = [];
   let hands;

   lines.push(`siteswap\n ${this.toString().replace(/\n/g, "\n ")}`);
   lines.push(`notation\n ${this.notation}`);
   lines.push(`degree\n ${this.degree}`);
   lines.push(`props\n ${this.props}`);
   lines.push(`period\n ${this.period}`);
   lines.push(`full period\n ${this.fullPeriod}`);
   lines.push(`multiplex\n ${this.multiplex}`);
   lines.push(`prime\n ${this.prime}`);
   lines.push(`ground state\n ${this.groundState}`);
   

   if( this.degree > 2 ){
      hands = alphabetic(this.degree);

      lines.push("hand labels");
      const oldLabels = notations[this.notation].hands(this.degree);
      const paddings = [];
      paddings.push( this.degree.toString().length + 1 );
      paddings.push( Math.max(...oldLabels.map(({length}) => length)) );
      paddings.push( Math.max(...hands.map(({length}) => length)) );
      for( let i = 0; i < this.degree; i++ ){
         const num   = pad(i + 1, paddings[0]);
         const hand1 = pad(hands[i], paddings[2]);
         const hand2 = pad(oldLabels[i], paddings[1]);
         lines.push( `${num}| ${hand1}${this.notation !== "multihand" ? ` (${hand2})` : ""}` );
      }

   }

   lines.push("throw sequence"); {
      const matrix = [];
      for( const [i, action] of this.throws.entries() ){
         const releases = action.map( (release) => {
            let string;
            if( this.degree <= 2 )
               string = release.map( ({value, handFrom, handTo}) => `${value}${handFrom !== handTo ? "x" : ""}` ).join(",");
            else
               string = release.map( ({value, handFrom, handTo}) => `${value}${hands[handTo]}` ).join(",");
            return release.length === 1 ? string : `[${string}]`;
         } );
         matrix.push( [`${i + 1}|`, ...releases] );
      }

      const paddings = [];
      for( let i = 0; i < matrix[0].length; i++ ){
         paddings.push( Math.max(...matrix.map(row => row[i].length + 1)) );
      }

      lines.push( ...matrix.map(row => row.map((string, i) => pad(string, paddings[i])).join("")) );
   }
   
   lines.push("states"); {
      const padding = this.period.toString().length + 1;
      for( const [i, schedule] of this.states.entries() ){
         for( const [j, handState] of schedule.entries() )
            lines.push( `${pad(j ? " " : (i + 1), padding)}| [${handState.join(",")}]` );
      }
   }

   lines.push("strict states"); {
      const padding = this.fullPeriod.toString().length + 1;
      for( const [i, schedule] of this.strictStates.entries() ){
         for( const [j, handState] of schedule.entries() )
            lines.push( `${pad(j ? "" : (i + 1), padding)}| [${handState.map(balls => `[${balls.length ? balls.join(",") : "-"}]`).join(",")}]` );
      }
   }

   lines.push("orbits"); {
      const padding = this.orbits.length.toString().length + 1;
      for( const [i, orbit] of this.orbits.entries() ){
         lines.push( ...orbit.toString().split("\n").map((row, j) => `${pad(j ? "" : (i + 1), padding)}| ${row}`) );
      }
   }

   lines.push("composition"); {
      const padding = this.composition.length.toString().length + 1;
      for( const [i, prime] of this.composition.entries() ){
         lines.push( ...prime.toString().split("\n").map((row, j) => `${pad(j ? "" : (i + 1), padding)}| ${row}`) );
      }
   }

   lines.push(" ");

   console.log( lines.join("\n") );

}


function pad( string, length ){
   
   if( typeof string !== "string" )
      string = string.toString();

   length++;
   return string.length >= length ? string : `${Array(length - string.length).join(" ")}${string}`;

}


export { log };