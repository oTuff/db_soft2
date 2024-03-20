// pages/api/population.js
import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

export default async function handler(req, res) {
    const { year } = req.query; // Extract the year from the query parameters

    if (req.method === 'GET') {
        try {
            await client.connect();
            const database = client.db("DB_Soft2");
            const organizationsCollection = database.collection("Organizations");

            // Ensure the year parameter is provided
            if (!year) {
                return res.status(400).json({ message: 'Please specify a year' });
            }

            // Convert year to number if it's not already
            const queryYear = parseInt(year, 10);

            // Find organizations with population details for the specified year
            const organizations = await organizationsCollection.find({
                "Population.PopulationYear": queryYear
            }, {
                projection: { OrganizationName: 1, "Population.$": 1 } // Project only organization name and matching population details
            }).toArray();

            if (!organizations.length) {
                return res.status(404).json({ message: 'No organizations found with population details for the specified year' });
            }

            res.status(200).json({ organizations });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        } finally {
            await client.close();
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
