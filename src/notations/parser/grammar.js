
import { bhtod } from "../../misc"
import { aton }  from "../../misc"


let whitespace = true


const macros = {

   // Allow whitespace.
   ws() {

      return { allow: " " }

   },

   // Trim whitespace.
   trim(rule) {

      const ws = macros.ws()
      return { symbols: [ws, rule, ws], processor: ([, result]) => result }

   },

   // Fixed value comma (possibly surrounded by whitespace) or whitespace.
   separator() {

      if (whitespace) {
         const ws = macros.ws()
         return { either: [{ symbols: [ws, ",", ws] }, " "], fixed: true }
      }
      else {
         return { either: [",", " "], fixed: true }
      }

   },

   // Rule repeated `min` or more times (possibly separated).
   separated(sep, min, rule) {

      return {
         symbols: [rule, { repeat: [sep, rule], min: min - 1, max: Infinity }],
         processor: ([first, [...rest]]) => [first, ...rest.map(([, result]) => result)]
      }

   },

   // One `toss` without brackets or many separated inside brackets (with all the possible whitespace).
   release(toss, sep) {

      const tosses = macros.separated(sep, 2, toss)
      return {
         either: [
            { symbols: [toss] },
            { symbols: ["[", whitespace ? macros.trim(tosses) : tosses, "]"], processor: ([, result]) => result }
         ]
      }

   },

   asyncSiteswap(toss, sep) {

      return {
         symbol: macros.separated(sep, 1, macros.release(toss, sep)),
         processor: (releases) => releases.map((release) => [release])
      }

   },

   syncSiteswap(toss, sep1, sep2) {

      const ws = macros.ws()
      const release = macros.release(toss, sep1)


      if (whitespace) {
         const action = { symbols: ["(", ws, release, sep2, release, ws, ")"], processor: ([, , release1, , release2]) => [release1, release2] }
         return {
            symbols: [macros.separated(ws, 1, action), ws, { allow: "*" }],
            processor: ([throws, , mirror]) => (mirror ? mirrorSync(throws) : throws)
         }
      }
      else {
         const action = { symbols: ["(", release, sep2, release, ")"], processor: ([, release1, , release2]) => [release1, release2] }
         return {
            symbols: [macros.separated(null, 1, action), { allow: "*" }],
            processor: ([throws, mirror]) => (mirror ? mirrorSync(throws) : throws)
         }
      }

   }

}

// Order matters.
const terminals = [
   { tokenType: "[", regex: "\\[" },
   { tokenType: "]", regex: "\\]" },
   { tokenType: "(", regex: "\\(" },
   { tokenType: ")", regex: "\\)" },
   { tokenType: "<", regex: "<" },
   { tokenType: ">", regex: ">" },
   { tokenType: "\n", regex: "\n" },
   { tokenType: "|", regex: "\\|" },
   { tokenType: "-", regex: "-" },
   { tokenType: ",", regex: "," },
   { tokenType: " ", regex: " +" },
   { tokenType: "*", regex: "\\*" },
   { tokenType: "x", regex: "x", processor: () => true },
   { tokenType: "pN", regex: "p(?:[1-9][0-9]*|0)", processor: (match) => toNumber(match.slice(1)) },
   { tokenType: "p", regex: "p", processor: () => true },
   { tokenType: "digit", regex: "[0-9]", processor: toNumber },
   { tokenType: "digit_even", regex: "[02468]", processor: toNumber },
   { tokenType: "letter", regex: "[a-zA-Z]", processor: aton },
   { tokenType: "letter_even", regex: "[acegikmoqsuwyACEGIKMOQSUWY]", processor: aton },
   { tokenType: "letter_capital", regex: "[A-Z]" },
   { tokenType: "integer", regex: "[1-9][0-9]*|[0-9]", processor: toNumber },
   { tokenType: "integer_even", regex: "[1-9][0-9]*[02468]|[02468]", processor: toNumber }
]


const rules = {

   "standard_async": () => {
      whitespace = true
      return {
         symbol: macros.trim(macros.asyncSiteswap("integer", macros.separator())),
         processor: finaliseAsync
      }
   },

   "compressed_async": () => {
      whitespace = false
      return {
         symbol: macros.trim(macros.asyncSiteswap({ either: ["digit", "letter"] }, null)),
         processor: finaliseAsync
      }
   },

   "standard_sync": () => {
      whitespace = true
      const sep = macros.separator()
      const toss = {
         symbols: ["integer_even", { allow: "x" }],
         processor: ([value, cross]) => ({ value, cross: Boolean(cross) })
      }
      return {
         symbol: macros.trim(macros.syncSiteswap(toss, sep, sep)),
         processor: finaliseSync
      }
   },

   "compressed_sync": () => {
      whitespace = false
      const sep = { allow: macros.separator(), fixed: true }
      const toss = {
         symbols: [{ either: ["digit_even", "letter_even"] }, { allow: "x" }],
         processor: ([value, cross]) => ({ value, cross: Boolean(cross) })
      }
      return {
         symbol: macros.trim(macros.syncSiteswap(toss, null, sep)),
         processor: finaliseSync
      }
   },

   "multihand": () => {
      whitespace = true

      const ws = macros.ws()


      const handAlpha = {
         either: [
            {
               symbols: [{ repeat: [{ symbol: "letter_capital", fixed: true, value: "A" }], min: 1, max: Infinity }, { allow: ["letter_capital"] }],
               processor: ([rest, last]) => (last ? [...rest, last].join("") : rest.join(""))
            },
            "letter_capital"
         ],
         processor: bhtod
      }
      const tossAlpha = {
         symbols: [handAlpha, "integer"],
         processor: ([hand, value]) => ({ value, hand })
      }
      const tossNum = {
         symbols: ["(", ws, { allow: "-" }, "integer", ws, ",", ws, "integer", ws, ")"],
         processor: ([, , minus, hand, , , , value]) => ({ value, offset: minus ? -hand : hand })
      }

      const sep1 = macros.trim(",")
      const sep2 = macros.trim("\n")

      return {
         symbol: macros.trim({
            either: [
               macros.separated(sep2, 1, macros.separated(sep1, 1, macros.release(tossAlpha, sep1))),
               macros.separated(sep2, 1, macros.separated(ws, 1, macros.release(tossNum, ws)))
            ]
         }),
         processor: finaliseMultihand
      }
   },

   "passing_async": () => {
      whitespace = true

      const siteswap1 = macros.trim(macros.asyncSiteswap({ symbols: ["integer", { allow: "p" }], processor: ([value, pass]) => ({ value, pass }) }, macros.separator()))
      const siteswap2 = macros.trim(macros.asyncSiteswap({ symbols: ["integer", { allow: "pN" }], processor: ([value, pass]) => ({ value, pass }) }, macros.separator()))

      return {
         symbol: macros.trim({
            either: [
               { symbols: ["<", siteswap1, "|", siteswap1, ">"], processor: ([, siteswap1, , siteswap2]) => [siteswap1, siteswap2] },
               { symbols: ["<", macros.separated("|", 2, siteswap2), ">"], processor: ([, siteswaps]) => siteswaps }
            ]
         }),
         processor: finalisePassingAsync
      }
   },

   "passing_sync": () => {
      whitespace = true

      const sep1 = macros.separator()
      const sep2 = macros.separator()
      const sep3 = macros.separator()
      const sep4 = macros.separator()

      const siteswap1 = macros.trim({
         either: [
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "x" }, { allow: "p" }], processor: ([value, cross, pass]) => ({ value, pass, cross }) }, sep1, sep1),
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "p" }, { allow: "x" }], processor: ([value, pass, cross]) => ({ value, pass, cross }) }, sep2, sep2)
         ]
      })
      const siteswap2 = macros.trim({
         either: [
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "x" }, { allow: "pN" }], processor: ([value, cross, pass]) => ({ value, pass, cross }) }, sep3, sep3),
            macros.syncSiteswap({ symbols: ["integer_even", { allow: "pN" }, { allow: "x" }], processor: ([value, pass, cross]) => ({ value, pass, cross }) }, sep4, sep4)
         ]
      })

      return {
         symbol: macros.trim({
            either: [
               { symbols: ["<", siteswap1, "|", siteswap1, ">"], processor: ([, siteswap1, , siteswap2]) => [siteswap1, siteswap2] },
               { symbols: ["<", macros.separated("|", 2, siteswap2), ">"], processor: ([, siteswaps]) => siteswaps }
            ]
         }),
         processor: finalisePassingSync
      }
   }

}


for (let i = 0; i < terminals.length; i++) {
   const terminal = terminals[i]
   terminal.index = i
   rules[terminal.tokenType] = terminal
}



function toNumber(n) {
   return Number(n)
}

function lcm(a, b) {
   const greater = Math.max(a, b)
   const smaller = Math.min(a, b)
   let result = greater
   while (result % smaller !== 0)
      result += greater
   return result
}



function mirrorSync(throws) {

   // Same tosses reused here (finalise functions create new objects anyway)
   return throws.concat(throws.map((action) => action.map((release) => [...release]).reverse()))

}

// Standard and compressed async.
function finaliseAsync(throws) {

   for (const action of throws) {
      for (const release of action) {
         for (let i = 0; i < release.length; i++)
            release[i] = { value: release[i], from: 0, to: 0 }
      }
   }
   return throws

}

// Standard and compressed sync.
function finaliseSync(throws) {

   for (const action of throws) {
      for (let i = 0; i < action.length; i++) {
         const release = action[i]
         for (let j = 0; j < release.length; j++) {
            const { value, cross } = release[j]
            release[j] = { value: value / 2, from: i, to: cross ? 1 - i : i }
         }
      }
   }

   return throws

}

function finaliseMultihand(rows) {

   const period = rows.map(({ length }) => length).reduce(lcm)
   const throws = []
   for (let i = 0; i < period; i++) {
      const action = rows.map((row) => row[i % row.length]).map((release, from) => {
         return release.map(({ value, hand, offset }) => {
            const to = offset === undefined ? hand : from + offset
            return { value, from, to }
         })
      })
      throws.push(action)
   }
   return throws

}

function finalisePassingAsync(siteswaps) {

   const period = siteswaps.map(({ length }) => length).reduce(lcm)
   const throws = []
   for (let i = 0; i < period; i++) {
      const action = siteswaps.map((actions) => actions[i % actions.length][0]).map((release, from) => {
         return release.map(({ value, pass }) => {
            if (pass === true)
               pass = 2 - from
            const to = pass === null ? from : pass - 1
            return { value, from, to }
         })
      })
      throws.push(action)
   }
   return throws

}

function finalisePassingSync(siteswaps) {

   const period = siteswaps.map(({ length }) => length).reduce(lcm)
   const throws = []
   for (let i = 0; i < period; i++) {
      const action = Array.prototype.concat(...siteswaps.map((siteswap) => siteswap[i % siteswap.length])).map((release, from) => {
         return release.map(({ value, pass, cross }) => {
            if (pass === true)
               pass = 2 - Math.floor(from / 2)
            const to = (pass === null ? from : ((pass - 1) * 2) + (from % 2)) + (cross ? from % 2 ? -1 : 1 : 0)    // eslint-disable-line no-nested-ternary
            return { value: value / 2, from, to }
         })
      })
      throws.push(action)
   }
   return throws

}



export { rules }
