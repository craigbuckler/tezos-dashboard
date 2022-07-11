// database connection
import { MongoClient } from 'mongodb';

// connect to MongoDB
const client = new MongoClient(
  `mongodb://${ process.env.MONGO_DBUSER }:${ process.env.MONGO_DBPASS }@${ process.env.MONGO_DBHOST }:${ process.env.MONGO_DBPORT }/${ process.env.MONGO_DBNAME }?authSource=${ process.env.MONGO_DBNAME }`
);

let conn = null;

// connect to database
try {
  await client.connect();
  conn = client.db( process.env.MONGO_DBNAME );
}
catch(e) {
  console.log(e);
  await close();
}

// close connection
async function close() {
  conn = null;
  await client.close();
}

// export
export { conn, close };
