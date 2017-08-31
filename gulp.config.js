
const babel   = require("babel-core");
const rollup  = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const uglify  = require("uglify-js");
const umd     = require("umd");
const nearley = require("nearley");

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

   umd:     (contents, file) => umd("Siteswap", contents, { commonJS: true }),

   nearley: (contents, file) => { try{
                                    const Parser = require('nearley/lib/nearley.js').Parser;
                                    const grammar = require('nearley/lib/nearley-language-bootstrapped.js');
                                    const compile = require('nearley/lib/compile.js');
                                    const generate = require('nearley/lib/generate.js');
                                    const parser = new Parser(grammar.ParserRules, grammar.ParserStart);
                                    return generate( compile(parser.feed(contents.toString()).results[0], {}) );
                                  } catch(e){
                                    handleNearleyError(e);
                                  }
                                }
};


const configuration = {

  tasks: {

    "nearley": {
      src: "src/notations/parser/grammar.ne",
      dest: "src/notations/parser/",
      rename: { extname: ".js" },
      transforms: [t.nearley]
    },

    "bundle": {
      watch: "src/*.js",
      parallel: ["bundle:js", "bundle:js:min"]
    },

    "bundle:js": {
      src: "src/entry.js",
      rename: "dist/siteswap.js",
      transforms: [t.rollup, t.umd]
    },

    "bundle:js:min": {
      src: "src/entry.js",
      rename: "dist/siteswap.min.js",
      transforms: [t.rollup, t.babel, t.uglify, t.umd]
    },


    "build": {
      watch: "src/notations/parser/grammar.ne",
      series: ["nearley", "bundle"]
    },

    "default": {
      series: ["build", "watch"]
    }

  }

};

module.exports = configuration;



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

function handleNearleyError(e){

   throw `\nNearley errored out\n\n ${e.message}\n\n`;

}