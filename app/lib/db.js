import { MongoClient } from "mongodb";

const uri = "mongodb+srv://kishancmcoco_db_user:2NQDG4HTBqQMd25H@cluster0.nnj8sew.mongodb.net/?appName=Cluster0"; // keep your existing one

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000 // 🔥 prevents hanging
  });

  global._mongoClientPromise = client.connect().catch(err => {
    console.error("MongoDB Connection Failed:", err.message);
    return null; // 🔥 prevent crash
  });
}

clientPromise = global._mongoClientPromise;

export default clientPromise;