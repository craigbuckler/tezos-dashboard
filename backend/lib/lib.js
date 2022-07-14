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


// format a date
export function dateFormat(d = new Date()) {

  return (
    d.getUTCFullYear() + '-' +
    pad(d.getUTCMonth() + 1, 2, '0') + '-' +
    pad(d.getUTCDate(), 2, '0') + ' ' +
    pad(d.getUTCHours(), 2, '0') + ':' +
    pad(d.getUTCMinutes(), 2, '0') + ':' +
    pad(d.getUTCSeconds(), 2, '0')
  );

}


// run an executable
// returns { code, out } where code is non-zero for errors
export function execCmd(cmd, timeout) {

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
