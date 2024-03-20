import { MongoClient } from "mongodb";

const MONGO_URL = "mongodb://localhost:27017/DB_Soft2";
const DB_NAME = "DB_Soft2";

async function connectToDatabase() {
  const client = await MongoClient.connect(MONGO_URL);
  return client.db(DB_NAME);
}

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("Organizations"); // Use the correct collection name

    // Aggregation pipeline
    const pipeline = [
      {
        $unwind: "$OrganizationDetails",
      },
      {
        $unwind: "$OrganizationDetails.Location",
      },
      {
        $group: {
          _id: "$OrganizationDetails.Location.CountryName", // Group by country name
          TotalLandArea: { $sum: "$OrganizationDetails.Location.LandArea" }, // Sum of land area
          AverageTemperature: {
            $avg: "$OrganizationDetails.Location.AverageTemperature",
          }, // Average of temperature
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          CountryName: "$_id", // Rename _id to CountryName
          TotalLandArea: 1,
          AverageTemperature: 1,
        },
      },
    ];

    // Execute the aggregation query
    const countries = await collection.aggregate(pipeline).toArray();

    res.status(200).json(countries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error connecting to the database", error });
  }
}
