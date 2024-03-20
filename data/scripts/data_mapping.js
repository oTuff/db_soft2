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

        // Define collections to merge, excluding Organizations itself
        const collectionsToMerge = [
            'Assessment',
            'EmissionResult',
            'Gases',
            'Methodology',
            'OrganizationDetails',
            'OrganizationGDP',
            'OrganizationGases',
            'Population',
            'TargetEmission'
        ];

        // Process each collection
        for (const collectionName of collectionsToMerge) {
            const collection = database.collection(collectionName);
            const documents = await collection.find().toArray();

            for (const doc of documents) {
                const query = { AccountNo: doc.AccountNo };
                const update = { $addToSet: { [collectionName]: doc } }; // Use $addToSet to avoid duplicates
                const options = { upsert: true };
                await database.collection('Organizations').updateOne(query, update, options);
            }
        }

        // Merge Location and Country details
        // Assuming OrganizationDetails links to Location via LocationID, and Location links to Country via CountryID
        const organizations = await database.collection('Organizations').find().toArray();
        for (const org of organizations) {
            const details = org.OrganizationDetails || [];
            for (const detail of details) {
                const location = await database.collection('Location').findOne({ LocationID: detail.LocationID });
                if (location) {
                    const country = await database.collection('Countries').findOne({ CountryID: location.CountryID });
                    // Assuming you want to add country name directly under Location
                    if (country) {
                        location.CountryName = country.CountryName;
                    }
                    const locUpdate = { $set: { 'OrganizationDetails.$.Location': location } };
                    await database.collection('Organizations').updateOne({ _id: org._id, 'OrganizationDetails.LocationID': detail.LocationID }, locUpdate);
                }
            }
        }

        console.log('Merge completed successfully.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
    }
}

mergeCollections().catch(console.dir);
