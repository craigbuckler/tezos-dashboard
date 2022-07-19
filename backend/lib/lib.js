// miscellaneous utility functions
import { exec } from 'node:child_process';
import { appendFile } from 'node:fs/promises';

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


// date +/- days
export function dateDayAdd(d, days = 0) {

  const date = dateNew(d);
  if (date) date.setUTCDate(date.getUTCDate() + days);
  return date;

}


// date at midnight
export function dateNew(d) {

  const date = (d || d instanceof Date ? new Date(d) : new Date());
  if (String(date) === 'Invalid Date') return null;
  date.setUTCMilliseconds(0);
  date.setUTCSeconds(0);
  date.setUTCMinutes(0);
  date.setUTCHours(0);
  date.setUTCDate(date.getUTCDate());
  date.setUTCMonth(date.getUTCMonth());
  date.setUTCFullYear(date.getUTCFullYear());
  return date;

}


// format a date
export function dateFormat(d = new Date()) {

  d = new Date(d);
  return (
    d.getUTCFullYear() + '-' +
    pad(d.getUTCMonth() + 1, 2, '0') + '-' +
    pad(d.getUTCDate(), 2, '0') + ' ' +
    pad(d.getUTCHours(), 2, '0') + ':' +
    pad(d.getUTCMinutes(), 2, '0') + ':' +
    pad(d.getUTCSeconds(), 2, '0')
  );

}


// parse a string containing shortcodes
export function parseShortcodeString(str) {

  return str.replace(/(\{[^}]+\})/g, parseShortcode);

}


// parse a "{day:N}" shortcode and return a date
export function parseShortcode(sc) {

  sc = sc.trim();
  if (sc.at(0) !== '{' || sc.at(-1) !== '}') return null;

  let
    parse = sc.slice(1, -1).trim().split(':'),
    token = parse[0].toLowerCase(),
    inc = parseFloat(parse[1] || 0) || 0,
    val;

  if (token === 'day' || token === '+day') {
    val = dateDayAdd(null, inc);
    val = token.at(0) === '+' ? +new Date(val) : val;
  }

  return val;

}


// run an executable
// returns { code, out } where code is non-zero for errors
export function execCmd(cmd, timeout = 10) {

  return new Promise(resolve => {

    exec(cmd, { timeout: timeout * 1000 }, (error, stdout, stderr) => {

      resolve({
        code: error?.code || 0,
        out: stderr.trim() || stdout.trim() || ''
      });

    });

  });

}


// add content to a file
export async function fileAppend(file, data) {

  try {
    await appendFile(file, data);
    return true;
  }
  catch (e) {
    return false;
  }

}


// fetch JSON from an API
export async function fetchJSON(url) {

  const res = await fetch(url);
  return (await res.json());

}
