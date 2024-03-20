import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  const { organizations } = req.query;

  try {
    await client.connect();
    const database = client.db("DB_Soft2");
    const organizations = database.collection("Organizations");
    // const projection = { AccountNo: 1, OrganizationName: 1 }; // only include the name, email, and address fields in the results
    // const orgs = await organizations.find({}, projection).toArray();
    const orgs = await organizations.find({}).toArray();

    if (!orgs) {
      return res.status(404).json({ message: 'No organizations found' });
    }

    res.status(200).json({ organizations: orgs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// List all organizations with their respective country names.

// Get an organization’s total emission for a specific year.

// Find organizations that use a specific gas.

// List the population details of organizations for a specific year.

// Show organizations with their GDP in a specific year.

// Display the emission reduction targets for each organization.

// List all organizations that are a C40 city.

// List all gases used by a specific organization.

// Get Details of the methodology used by organizations.

// List countries with their total land area and average temperature.