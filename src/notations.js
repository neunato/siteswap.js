
import { declaration as standard_async }   from "./notations/standard_async";
import { declaration as standard_sync }    from "./notations/standard_sync";
import { declaration as compressed_async } from "./notations/compressed_async";
import { declaration as compressed_sync }  from "./notations/compressed_sync";


const notations = {

   "standard:async":   standard_async,
   "standard:sync":    standard_sync,
   "standard":         ["standard:async", "standard:sync"],
   "compressed:async": compressed_async,
   "compressed:sync":  compressed_sync,
   "compressed":       ["compressed:async", "compressed:sync"]

};

export { notations };