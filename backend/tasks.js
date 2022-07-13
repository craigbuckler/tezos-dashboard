// task runner
// calls APIs, stores in database, processes reducers, etc.
import task from './tasks.json' assert {type: 'json'};
import 'dotenv/config';

console.dir(task, { depth: null, color: true });
