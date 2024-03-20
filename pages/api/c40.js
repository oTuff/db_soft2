import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function handler(req, res) {
  try {
    await client.connect();
    const database = client.db("DB_Soft2");
    // GET /api/c40
    //List all organizations that are a C40 city.
    const orgs = database.collection("Organizations");
    const c40Cities = await orgs
      .aggregate([
        { $unwind: "$OrganizationDetails" },
        { $match: { "OrganizationDetails.C40": 1 } },
        { $project: { AccountNo: 1, OrganizationName: 1 } },
      ])
      .toArray();

    if (!c40Cities) {
      return res.status(404).json({ message: "No organizations found" });
    }

    res.status(200).json({ organizations: c40Cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
