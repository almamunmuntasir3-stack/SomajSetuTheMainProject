import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "shomajsetu";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to shomajsetu/.env.local.");
}

const globalForMongo = globalThis;

if (!globalForMongo.__shomajsetuMongo) {
  const client = new MongoClient(uri);
  // Start exactly one connection per process. Operations buffer until it
  // resolves, so importing this module never blocks on the database.
  const clientPromise = client.connect();
  clientPromise.catch(() => {}); // handled by getDb()/consumers instead
  globalForMongo.__shomajsetuMongo = { client, clientPromise };
}

export const { client, clientPromise } = globalForMongo.__shomajsetuMongo;
export const db = client.db(dbName);

export async function getDb() {
  await clientPromise;
  return db;
}

export default db;
