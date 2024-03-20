// pages/api/emissions/[organization].js
import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

export default async function handler(req, res) {
    const { organization } = req.query; // Extract the organization from the dynamic route parameter
    const { year } = req.query; // Extract the year from the query parameters

    if (req.method === 'GET') {
        try {
            await client.connect();
            const database = client.db("DB_Soft2");
            const organizationsCollection = database.collection("Organizations");

            const queryYear = parseInt(year, 10);

            // Find the organization by its name
            const orgData = await organizationsCollection.findOne({ OrganizationName: organization });

            if (!orgData) {
                return res.status(404).json({ message: 'Organization not found' });
            }

            // Find the emission details for the specified year within the organization document
            const emissionData = orgData.EmissionResult.find(emission => emission.ReportingYear === queryYear);

            if (!emissionData) {
                return res.status(404).json({ message: 'Emission details not found for the specified organization and year' });
            }

            // Respond with only the TotalCityEmissions for the specified year
            res.status(200).json({ TotalCityEmissions: emissionData.TotalCityEmissions });
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
