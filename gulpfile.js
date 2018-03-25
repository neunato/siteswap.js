
const babel   = require("babel-core");
const rollup  = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const uglify  = require("uglify-js");
const umd     = require("umd");

const package = require("./package.json");

const t = {

   rollup:  (contents, file) => rollup.rollup({ entry: file.path, plugins: [resolve()] })
                                 .then( bundle => bundle.generate({ format: "cjs" }) )
                                 .then( ({ code }) => code )
                                 .catch( handleRollupError ),

   uglify:  (contents, file) => { const options = { toplevel: true, mangle: { reserved: ["Siteswap","Juggle","Toss","State","Transition"] }};
                                  const { code, error } = uglify.minify({ [file.path]: contents.toString() }, options);
                                  if( error )
                                    handleUglifyError(error);
                                  return code; },

   babel:   (contents, file) => { try {
                                    return babel.transform(contents, package.babel).code;
                                  } catch(e){ 
                                    handleBabelError(e)
                                  }
                                },

   umd:     (contents, file) => umd("Siteswap", contents, { commonJS: true })

};


const configuration = {

  tasks: {

    "build": {
      watch: "src/*.js",
      parallel: ["build:js", "build:js:min"]
    },

    "build:js": {
      src: "src/entry.js",
      rename: "dist/siteswap.js",
      transforms: [t.rollup, t.umd]
    },

    "build:js:min": {
      src: "src/entry.js",
      rename: "dist/siteswap.min.js",
      transforms: [t.rollup, t.babel, t.uglify, t.umd]
    },

    "default": {
      series: ["build", "watch"]
    }

  }

};

require("glupost")(configuration);




// Convert plugin specific errors to a generic form.

function handleRollupError({ name, message, loc, frame }){

   let output = "\nRollup errored out\n\n";
   output += ` ${name}: ${message}\n`;
   if( loc )
      output += `     at ${loc.file}:${loc.line}:${loc.column}\n`;
   if( frame )
      output += `\n${frame.replace(/^/mg, " ")}\n`;
   throw output;

}

function handleBabelError({ name, message, loc, codeFrame: frame }){

   let output = "\nBabel errored out\n\n";
   output += ` ${name}: ${message}\n`;
   if( frame )
      output += `\n${frame.trim().replace(/^/mg, " ")}\n`;
   throw output;

}

function handleUglifyError({ name, message, filename, line, col }){

   let output = "\nUglify errored out\n\n";
   output += ` ${name}: ${message}\n     at ${filename}:${line}:${col}\n\n`;
   throw output;

}
