
import { declaration as standardAsync }   from "./notations/standard_async"
import { declaration as standardSync }    from "./notations/standard_sync"
import { declaration as compressedAsync } from "./notations/compressed_async"
import { declaration as compressedSync }  from "./notations/compressed_sync"
import { declaration as passingAsync }    from "./notations/passing_async"
import { declaration as passingSync }     from "./notations/passing_sync"
import { declaration as multihand }       from "./notations/multihand"


const notations = {

   "standard:async":   standardAsync,
   "standard:sync":    standardSync,
   "standard":         ["standard:async", "standard:sync"],
   "compressed:async": compressedAsync,
   "compressed:sync":  compressedSync,
   "compressed":       ["compressed:async", "compressed:sync"],
   "passing:async":    passingAsync,
   "passing:sync":     passingSync,
   "passing":          ["passing:async", "passing:sync"],
   "multihand":        multihand

}

export { notations }
