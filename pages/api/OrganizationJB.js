import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  const { year } = req.query;

  try {
    await client.connect();
    const database = client.db("DB_Soft2");
    const organizationsCollection = database.collection("Organizations");

    // Query to get organizations with their GDP in a specific year
    const gdpProjection = { OrganizationName: 1, GDP: 1, Year: 1 };
    const gdpQuery = year ? { Year: parseInt(year) } : {};
    const orgsWithGDP = await organizationsCollection.find(gdpQuery, { projection: gdpProjection }).toArray();

    // Query to get emission reduction targets for each organization
    const emissionProjection = { OrganizationName: 1, EmissionReductionTarget: 1 };
    const orgsWithEmissionTargets = await organizationsCollection.find({}, { projection: emissionProjection }).toArray();

    const response = {
      organizationsWithGDP: orgsWithGDP,
      organizationsWithEmissionTargets: orgsWithEmissionTargets
    };

    if (!orgsWithGDP.length && !orgsWithEmissionTargets.length) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    await client.close();
  }
}
