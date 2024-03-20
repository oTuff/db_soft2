const { MongoClient } = require('mongodb');

// MongoDB connection URI and Database Name
const uri = 'mongodb://localhost:27017/';
const dbName = 'DB_Soft2'; // Replace with your actual database name

async function deduplicateOrganizationGDP() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);

        // Fetch all organization documents
        const organizations = await database.collection('Organizations').find().toArray();

        for (const org of organizations) {
            if (!org.OrganizationGDP) continue; // Skip if no OrganizationGDP

            // De-duplicate based on a combination of GDPYear, GDPValue, and GDPCurrency
            const uniqueGDP = [];
            const seenCombinations = new Set();

            for (const gdp of org.OrganizationGDP) {
                const combo = `${gdp.GDPYear}-${gdp.GDPValue}-${gdp.GDPCurrency}`; // Create a unique key for each combination
                if (!seenCombinations.has(combo)) {
                    seenCombinations.add(combo);
                    uniqueGDP.push(gdp);
                }
            }

            // Update the document in the database with the de-duplicated OrganizationGDP
            await database.collection('Organizations').updateOne(
                { _id: org._id },
                { $set: { OrganizationGDP: uniqueGDP } }
            );
        }

        console.log('De-duplication of OrganizationGDP completed successfully.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
    }
}

deduplicateOrganizationGDP().catch(console.dir);
