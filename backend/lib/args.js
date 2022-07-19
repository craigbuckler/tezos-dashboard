/*
return an options object
e.g. node script.js opt1 opt2 -a 1 -b -c="three" opt3

returns:
{
  script "script.js"
  param: [ "opt1", "opt2", "opt3" ]
  option: {
    a: 1,
    b: true,
    c: "three"
  }
}

single - or double -- are valid
*/
import process from 'node:process';

// inital object
const args = {
  script: process.argv[1],
  param: [],
  option: {}
};

// expand arguments
const cmd = [];
process.argv.slice(2).forEach(p => {

  p.split(/^(-+[^='"`]+)=(.*$)/).forEach(i => {
    i = i.trim();
    if (i) cmd.push(i);
  });

});

// parse
let lastOpt = null;

cmd.forEach(i => {

  if (i.startsWith('-')) {

    let o = i.replace(/^-+/, '');
    if (o) {
      args.option[o] = true;
      lastOpt = o;
    }

  }
  else {

    if (i.toLowerCase() === 'true') i = true;
    else if (i.toLowerCase() === 'false') i = false;
    else if (!isNaN(Number(i))) i = Number(i);

    if (lastOpt) {
      args.option[lastOpt] = i;
    }
    else {
      args.param.push(i);
    }

    lastOpt = null;

  }

});

// export
export default args;
