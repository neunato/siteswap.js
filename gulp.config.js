
const babel = require("babel-core");
const rollup = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const uglify = require("uglify-js");
const umd = require("umd");

const version = require("./package.json").version;

const t = {
  rollup:   (contents, file) => rollup.rollup({ entry: file.path, plugins: [resolve()] })
                                .then( bundle => bundle.generate({ format: "cjs" }) )
                                .then( ({ code }) => code )
                                .catch(error => { throw error }),
  uglify:   (contents, file) => { const options = { toplevel: true, mangle: { reserved: ["Siteswap","Juggle","Toss","State","Transition"] }};
                                  const { code, error } = uglify.minify(contents.toString(), options);
                                  if( error )
                                    throw new Error(error);
                                  return code; },
  babel:    (contents, file) => babel.transform(contents, { presets: ["env"] }).code,
  umd:      (contents, file) => umd("Siteswap", contents, { commonJS: true })
};


const configuration = {

  tasks: {

    "build:js": {
      src: "src/entry.js",
      watch: "src/*.js",
      rename: "dist/siteswap-" + version + ".js",
      transforms: [t.rollup, t.umd],
    },
    "build:js:min": {
      src: "src/entry.js",
      watch: "src/*.js",
      rename: "dist/siteswap-" + version + ".min.js",
      transforms: [t.rollup, t.babel, t.uglify, t.umd],
    },
    "build": {
      parallel: ["build:js", "build:js:min"]
    },
    "default": {
      series: ["build", "watch"]
    }

  }

};

module.exports = configuration;
