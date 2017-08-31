
export { alphabetic };


function alphabetic( degree ){

  const offset = "A".charCodeAt(0);
  const count = "Z".charCodeAt(0) - offset + 1;

  return range(degree).map( (hand, i) => range(Math.floor(i / count)).map(key => String.fromCharCode(offset + key % count)).concat(String.fromCharCode(offset + i % count)).join("") );
  
}

function range( n ){

  return [...Array(n).keys()];
  
}
