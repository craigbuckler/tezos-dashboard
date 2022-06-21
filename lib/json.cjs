// JSON library

/*
flatten a nested array or object into name-value pairs
example:
{
  "a": [1, 2, {"three": 3}],
  "b": { "c": 4 }
}

becomes:
{
  "a_0": 1,
  "a_1": 2,
  "a_2_three": 3,
  "b_c": 4
}

it can be converted to an array of arrays using Object.entries
*/
module.exports.flatten = (objOrig, strStart = '', strEnd = '') => {

  const flat = {};
  recurse(objOrig, '');
  return flat;

  function recurse(obj, prop) {

    if (typeof obj === 'object') {

      // object property
      for (const p in obj) recurse(obj[p], prop ? `${prop}_${p}` : p);

    }
    else if (Array.isArray(obj)) {

      // array property
      obj.forEach((p, i) => recurse(p, `${prop}_${i}`));

    }
    else {

      // primitive property
      flat[strStart + prop + strEnd] = obj;

    }

  }

};
