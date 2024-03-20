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
    // GET /api/organizations
    // List all organizations with their respective country names.
    const organizations = database.collection("Organizations");
    const pipeline = [
      {
        $unwind: "$OrganizationDetails",
      },
      {
        $project: {
          AccountNo: 1,
          OrganizationName: 1,
          CountryName: "$OrganizationDetails.Location.CountryName",
        },
      },
    ];
    const orgs = await organizations.aggregate(pipeline).toArray();

    if (!orgs) {
      return res.status(404).json({ message: "No organizations found" });
    }

    res.status(200).json({ organizations: orgs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
