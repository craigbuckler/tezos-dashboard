// Express REST API
import process from 'node:process';
import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import * as db from './lib/db.js';

// configuration
const
  cfg = {
    port: process.env.API_PORT || 3100
  },
  dbReduce = db.conn.collection('reduce');

// initialize
const app = express();
app.disable( 'x-powered-by' );
app.use( compression() );


// single route
// e.g. /api/?reducer=current,exchange&timestamp=1658241852359
app.get('/api/', async (req, res) => {

  // query reducers
  const
    data = { timestamp: +new Date() },
    reducer = req.query.reducer.split(',').map(r => r.trim().toLowerCase()),
    timestamp = new Date( parseFloat(req.query.timestamp || 0) || 0 ),
    docs = await dbReduce.find({
      name: { $in: reducer },
      date: { $gt: timestamp },
    });

  // format results
  while (await docs.hasNext()) {
    const doc = await docs.next();
    if (doc.name && doc.data) {
      data[ doc.name ] = doc.data;
    }
  }

  // return JSON
  res.json( data );

});


// 404 error
app.use((req, res) => {
  res.status(404).send('Not found');
});

// start server
const server = app.listen(cfg.port, () => {
  console.log(`REST API listening on port ${ cfg.port }`);
});

// stop server
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {

  await db.close();

  server.close(() => {
    console.log('REST API shut down');
  });

}
