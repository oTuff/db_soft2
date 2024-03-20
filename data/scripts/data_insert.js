// Import MongoDB driver
const { MongoClient } = require('mongodb');

// MongoDB connection URI and Database Name
const uri = 'mongodb://localhost:27017/';
const dbName = 'DB_Soft2'; // Replace with your actual database name

async function mergeCollections() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB client
        await client.connect();
        const database = client.db(dbName);

        // List of all collections to merge into the Organizations collection, excluding Organizations itself
        const collectionsToMerge = ['Assessment', 'EmissionResult', 'Gases', 'Location', 'Methodology', 'OrganizationDetails', 'OrganizationGDP', 'OrganizationGases', 'Population', 'TargetEmission'];

        for (const collectionName of collectionsToMerge) {
            const collection = database.collection(collectionName);

            // Fetch all documents from the current collection
            const documents = await collection.find().toArray();

            for (const doc of documents) {
                // Use AccountNo to match the organization, or adapt based on your data structure
                const query = { AccountNo: doc.AccountNo };
                const update = { $push: { [collectionName]: doc } };
                const options = { upsert: true };

                // Update the Organizations collection
                await database.collection('Organizations').updateOne(query, update, options);
            }
        }

        console.log('Merge completed successfully.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        // Ensure the client will close when you finish/error
        await client.close();
    }
}

// Execute the merge function
mergeCollections().catch(console.dir);
