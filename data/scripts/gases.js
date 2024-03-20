const { MongoClient } = require('mongodb');

// MongoDB connection URI and Database Name
const uri = 'mongodb://localhost:27017/';
const dbName = 'DB_Soft2'; // Replace with your actual database name

// Mapping from the previous step
const gasIdToName = {
    1: 'CH4',
    2: 'HFCs',
    3: 'N2O',
    4: 'NF3',
    5: 'PFCs',
    6: 'SF6',
    7: 'CH4',
    8: 'CO2'
};

async function updateOrganizationGases() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);
        const organizations = await database.collection('Organizations').find().toArray();

        for (const org of organizations) {
            if (!org.OrganizationGases) continue; // Skip if no OrganizationGases

            const updatedGases = org.OrganizationGases.map(gas => {
                return { ...gas, GasName: gasIdToName[gas.GasID] };
            });

            // Update the document in the database with the enriched OrganizationGases
            await database.collection('Organizations').updateOne(
                { _id: org._id },
                { $set: { OrganizationGases: updatedGases } }
            );
        }

        console.log('OrganizationGases updated successfully.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
    }
}

updateOrganizationGases().catch(console.dir);
