// miscellaneous utility functions

// calculate MAJOR.MINOR.PATCH version as an integer
export function versionToInt(v) {
  var s = String(v).match(/\d+/gi);
  return s?.length === 3 ? (parseInt(s[0] || 0, 10) * 1000000) + (parseInt(s[1] || 0, 10) * 10000) + parseInt(s[2] || 0, 10) : 0;
}


// add leading characters to a number
export function pad(str, len = 2, chr=' ') {
  return String(str).padStart(len, chr).slice(-len);
}


// return a date based on the current time +/- seconds
export function nowOffset( seconds = 0 ) {
  return new Date( +new Date() + (seconds * 1000) );
}
