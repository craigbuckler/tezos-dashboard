// task runner
// calls APIs, stores in database, processes reducers, etc.
import task from './tasks.json' assert {type: 'json'};
import 'dotenv/config';
import { dateFormat, execCmd, fileAppend } from './lib/lib.js';

const queue = [];
let inProcessing = false;

// push tasks to queue
task.process.forEach(t => { if (!t.disabled) queue.push(t) });

// check for new tasks every task.timeout seconds
const start = async () => { await processQueue(); };
setInterval(
  start,
  task.timeout * 1000
);

// ____________________________________
// process queue items
async function processQueue() {

  if (inProcessing || !queue.length) return;

  inProcessing = true;
  let job = queue.shift();

  console.log(`${ dateFormat() } ${ job.name }`);

  // run executable
  const res = await execCmd(job.cmd, job.timeout || task.timeout);

  // error count fail / success?
  job.error = res.code ? (job.error || 0) + 1 : 0;

  // determine time of next run
  let nextRun;
  const m = res.out.match(/NEXT:\s*(\d+)/i);
  if (m && m.length === 2) nextRun = parseInt(m[1], 10) || 0;

  if (!nextRun) {

    if (job.error) {
      // error retry
      nextRun = task.errorRetry[ Math.min(job.error, task.errorRetry.length) - 1 ];
    }
    else {
      // default retry
      nextRun = job.retry || task.retry;
    }

  }

  // log result
  if (task.log) {
    await fileAppend(task.log, `${ dateFormat() } ${ job.name }\n                    ${ res.out } -${ job.error ? ' error: ' + job.error : '' } rerun: ${ nextRun }s\n\n`);
  }

  // reschedule job
  setTimeout(() => { queue.push(job); }, (nextRun * 1000) + 100);

  // job complete
  inProcessing = false;

  // next queued task
  setImmediate( start );

}
