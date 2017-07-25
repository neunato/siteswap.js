
const babel   = require("babel-core");
const rollup  = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const uglify  = require("uglify-js");
const umd     = require("umd");
const nearley = require("nearley");

const version = require("./package.json").version;

const t = {
  rollup:   (contents, file) => rollup.rollup({ entry: file.path, plugins: [resolve()] })
                                .then( bundle => bundle.generate({ format: "cjs" }) )
                                .then( ({ code }) => code )
                                .catch(error => { throw new Error(error) }),
  uglify:   (contents, file) => { const options = { toplevel: true, mangle: { reserved: ["Siteswap","Juggle","Toss","State","Transition"] }};
                                  const { code, error } = uglify.minify(contents.toString(), options);
                                  if( error )
                                    throw new Error(error);
                                  return code; },
  babel:    (contents, file) => babel.transform(contents, { presets: ["env"] }).code,
  umd:      (contents, file) => umd("Siteswap", contents, { commonJS: true }),

  nearley:  function(contents, file){

    const Parser = require('nearley/lib/nearley.js').Parser;
    const grammar = require('nearley/lib/nearley-language-bootstrapped.js');
    const compile = require('nearley/lib/compile.js');
    const generate = require('nearley/lib/generate.js');
    const parser = new Parser(grammar.ParserRules, grammar.ParserStart);
    return generate( compile(parser.feed(contents.toString()).results[0], {}) );

  }

};


const configuration = {

  tasks: {

    "build:js": {
      src: "src/entry.js",
      watch: "src/**/*.js",
      rename: "dist/siteswap-" + version + ".js",
      transforms: [t.rollup, t.umd]
    },

    "build:js:min": {
      src: "src/entry.js",
      watch: "src/**/*.js",
      rename: "dist/siteswap-" + version + ".min.js",
      transforms: [t.rollup, t.babel, t.uglify, t.umd]
    },

    "nearley": {
      src: "src/notations/*/*.ne",
      watch: "src/notations/**/*.ne",
      dest: "src/notations/",
      rename: { extname: ".js" },
      transforms: [t.nearley]
    },

    "build": {
      series: ["nearley", { parallel: ["build:js", "build:js:min"] }]
    },

    "default": {
      series: ["build", "watch"]
    }

  }

};

module.exports = configuration;
