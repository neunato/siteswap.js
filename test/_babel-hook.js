
require("babel-register")({
   presets: ["env", {
      plugins: [["transform-builtin-extend", { globals: ["Error"] }]]
   }]
})
