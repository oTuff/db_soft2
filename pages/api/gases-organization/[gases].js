// pages/api/gases-organization/[gases].js
import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

export default async function handler(req, res) {
    const { gases } = req.query; // Corrected to match the dynamic route parameter name

    if (req.method === 'GET') {
        try {
            await client.connect();
            const database = client.db("DB_Soft2");
            const gasMappings = await database.collection("Gases").find({}).toArray();
            const gasId = gasMappings.find(gas => gas.GasName.trim().toLowerCase() === gases.trim().toLowerCase())?.GasID; // Corrected variable name

            if (!gasId) {
                return res.status(404).json({ message: 'Gas not found' });
            }

            const organizations = await database.collection("Organizations").find({
                OrganizationGases: { $elemMatch: { GasID: gasId } }
            }).toArray();

            if (!organizations.length) {
                return res.status(404).json({ message: 'No organizations found using the specified gas' });
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
