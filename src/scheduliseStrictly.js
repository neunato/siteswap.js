
// Strict states are derived from "normal" states (defined in `src/graph.js`), and implement their own
// `.advance()` and `.equals()` functions.

function scheduliseStrictly(siteswap) {

   const schedules = []
   const first = strictify(siteswap.states[0])
   let last = first
   do {
      for (const action of siteswap.throws) {
         schedules.push(last)
         last = advance(last, action)
      }
   } while (!equal(first, last))
   return schedules

}

function strictify(schedule) {

   let ball = 0
   return schedule.map((s) => s.map((c) => Array(c).fill().map(() => ++ball)))

}

function advance(schedule, action) {

   const next = schedule.map((state) => state.slice(1).map((balls) => [...balls]))

   for (let i = 0; i < action.length; i++) {
      const release = action[i]

      // The only way to advance from an "empty" 0-state is by throwing 0s. We don't validate structure (state to
      // toss distribution match) here because it's done in `src/graph.js` for `.states`.
      if (!release.length && release.every(({ value, to, from }) => value === 0 && to === i && from === i))
         continue

      for (let j = 0; j < release.length; j++) {
         const toss = release[j]

         if (toss.value <= 0)
            continue

         const ball = schedule[toss.from][0][j]

         for (let h = 0; h < next.length; h++) {
            for (let k = schedule[0].length - 1; k < toss.value; k++) {
               if (!next[h][k])
                  next[h][k] = []
            }
         }

         next[toss.to][toss.value - 1].push(ball)

      }

   }

   return next

}

function equal(schedule1, schedule2) {

   if (schedule1.length !== schedule2.length)
      return false

   for (let i = 0; i < schedule1.length; i++) {
      const subschedule1 = schedule1[i]
      const subschedule2 = schedule2[i]

      if (subschedule1.length !== subschedule2.length)
         return false

      for (let j = 0; j < subschedule1.length; j++) {
         const balls1 = subschedule1[j]
         const balls2 = subschedule2[j]

         if (balls1.length !== balls2.length)
            return false

         for (let k = 0; k < balls1.length; k++) {
            if (balls1[k] !== balls2[k])
               return false
         }
      }
   }

   return true

}


export { scheduliseStrictly }
