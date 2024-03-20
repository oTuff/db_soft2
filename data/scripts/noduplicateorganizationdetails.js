const { MongoClient } = require('mongodb');

// MongoDB connection URI and Database Name
const uri = 'mongodb://localhost:27017/';
const dbName = 'DB_Soft2'; // Replace with your actual database name

async function deduplicateOrganizationDetails() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);

        // Fetch all organization documents
        const organizations = await database.collection('Organizations').find().toArray();

        for (const org of organizations) {
            if (!org.OrganizationDetails) continue; // Skip if no OrganizationDetails

            // De-duplicate based on LocationID
            const uniqueDetails = [];
            const seenLocationIDs = new Set();

            for (const detail of org.OrganizationDetails) {
                if (!seenLocationIDs.has(detail.LocationID)) {
                    seenLocationIDs.add(detail.LocationID);
                    uniqueDetails.push(detail);
                }
            }

            // Update the document in the database with the de-duplicated OrganizationDetails
            await database.collection('Organizations').updateOne(
                { _id: org._id },
                { $set: { OrganizationDetails: uniqueDetails } }
            );
        }

        console.log('De-duplication of OrganizationDetails completed successfully.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
    }
}

deduplicateOrganizationDetails().catch(console.dir);
