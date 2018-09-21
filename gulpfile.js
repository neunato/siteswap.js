
"use strict"        // eslint-disable-line strict


const rollup = require("rollup")
const resolve = require("rollup-plugin-node-resolve")
const commonjs = require("rollup-plugin-commonjs")
const minify = require("babel-minify")


const t = {

   rollup(contents, file) {
      return rollup.rollup({ input: file.path, plugins: [resolve(), commonjs()] })
         .then((bundle) => bundle.generate({ format: "umd", name: "Siteswap" }))
         .then(({ code }) => code)
         .catch(handleRollupError)
   },

   minify(contents) {
      try {
         return minify(contents, { mangle: { exclude: ["Siteswap", "SiteswapError"] } }).code
      }
      catch (e) {
         handleMinifyError(e)
      }
   }

}


const configuration = {

   tasks: {

      "build": {
         watch: "src/*.js",
         src: "src/_entry.js",
         rename: "dist/siteswap.js",
         transforms: [t.rollup, t.minify]
      },

      "default": {
         series: ["build", "watch"]
      }

   }

}

require("glupost")(configuration)



function handleRollupError({ name, message, loc, frame }) {

   let output = "\nRollup errored out\n\n"
   output += ` ${name}: ${message}\n`
   if (loc)
      output += `     at ${loc.file}:${loc.line}:${loc.column}\n`
   if (frame)
      output += `\n${frame.replace(/^/mg, " ")}\n`
   throw output

}

function handleMinifyError({ name, message }) {

   throw `\nMinify errored out\n\n ${name}: ${message}\n`       // eslint-disable-line no-throw-literal

}
