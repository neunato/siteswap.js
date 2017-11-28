
function isGround( schedule ){

   return schedule.every(handSchedule => handSchedule.every( (value, index, {length}) => value === 1 || (value === 0 && index === length - 1) ));

}

export { isGround };