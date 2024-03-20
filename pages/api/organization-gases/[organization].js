import { MongoClient } from "mongodb";
import { parse } from "path";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function handler(req, res) {
  const { organization } = req.query;

  try {
    await client.connect();
    const database = client.db("DB_Soft2");
    // GET /api/organization-gases/[organization]
    //List all gases used by a specific organization.
    const accountNo = parseInt(organization);
    const gases = database.collection("Organizations");
    const orgGases = await gases
      .aggregate([
        { $match: { AccountNo: accountNo } },
        { $unwind: "$OrganizationGases" },
        {
          $project: {
            AccountNo: 1,
            OrganizationName: 1,
            GasName: "$OrganizationGases.GasName",
          },
        },
      ])
      .toArray();

    if (!orgGases) {
      return res.status(404).json({ message: "No organizations found" });
    }

    res.status(200).json({ gasses: orgGases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
