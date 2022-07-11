// task runner
// calls APIs, stores in database, processes reducers, etc.
import process from 'node:process';
import 'dotenv/config';

console.log('tasks.js');

console.dir(process.env, { depth: null, color: true });
