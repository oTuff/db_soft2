import { MongoClient, ObjectId } from "mongodb";

const MONGO_URL = "mongodb://localhost:27017/DB_Soft2";
const DB_NAME = "DB_Soft2";

async function connectToDatabase() {
  const client = await MongoClient.connect(MONGO_URL);
  return client.db(DB_NAME);
}

export default async function handler(req, res) {
  const { organization } = req.query;

  try {
    const db = await connectToDatabase();
    const collection = db.collection("Organizations");

    // Check if the organization ID is a valid ObjectId
    if (!ObjectId.isValid(organization)) {
      return res.status(400).json({ message: "Invalid Organization ID" });
    }

    // Use ObjectId to convert string to MongoDB ObjectId
    const organizationId = new ObjectId(organization);

    const organizationData = await collection.findOne(
      { "_id": organizationId },
      { projection: { "Methodology": 1 } }
    );

    if (organizationData) {
      res.status(200).json(organizationData);
    } else {
      res.status(404).json({ message: "Organization not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error connecting to database", error });
  }
}
