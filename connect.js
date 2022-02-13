const { MongoClient } = require("mongodb");

const dotenv = require("dotenv").config();
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

async function main() {
  const uri =
    "mongodb+srv://" +
    DB_USER +
    ":" +
    DB_PASS +
    "@cluster0.kayee.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    // await listDatabases(client);

    // await createListing(client, {
    //     firstName: "Robin",
    //     lastName: "Singh",
    // });
    // await createMultipleListings(client, [
    //     {
    //         name: "Jojo",
    //         lastName: "joames"
    //     },
    //     {
    //         name: "John",
    //         lastName: "Doe"
    //     },
    //     {
    //         name: "Jane",
    //         lastName: "Doe"
    //     }
    // ]);

    // await findOneListingByName(client, "Jojo");

    // await findMinimumBedroomsBathroomsAndMosrRecentReviews(client, {
    //   minimumBedrooms: 3,
    //   minimumBathrooms: 3,
    //   maxResults: 5,
    // });

    // await updateListingByName(client, "Jojo", {bedrooms:6, beds:8})
    // await upsertListingByName(client, 'Jojo', {bathrooms: 2})

    // await updateAllListingsToHavePropertyType(client);

    // await deleteListingByName(client, "Jojo")
  } catch (e) {
    console.error(e);
  } finally {
    client.close();
  }
}
main().catch(console.error);

//  Create operation on mongoDB cluster

async function createListing(client, newListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertOne(newListing);

  console.log(
    `New listing created with the following ID : ${result.insertedId}`
  );
}

async function createMultipleListings(client, newListings) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertMany(newListings);
  console.log(
    `${result.insertedCount} : new listings created with the folloeing id(s)`
  );

  console.log(result.insertedIds);
}

// Read the database

async function findOneListingByName(client, listingName) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .findOne({ name: listingName });

  if (result) {
    console.log(`Found one  listing by the name '${listingName}'`);
    console.log(result);
  } else {
    console.log(`No result found with the listing name : ${listingName}`);
  }
}

async function findMinimumBedroomsBathroomsAndMosrRecentReviews(
  client,
  {
    minimumBedrooms = 0,
    minimumBathrooms = 0,
    maxResults = Number.MAX_SAFE_INTEGER,
  } = {}
) {
  const cursor = client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({
      bedrooms: { $gte: minimumBedrooms },
      bathrooms: { $gte: minimumBathrooms },
    })
    .sort({ last_review: -1 })
    .limit(maxResults);

  const results = await cursor.toArray();

  if (results.length > 0) {
    console.log(
      `Found listing(s) with at least ${minimumBedrooms} bedrooms and ${minimumBathrooms} bathrooms`
    );

    results.forEach((result, i) => {
      console.log(" ");
      console.log(`${i + 1} Name: ${result.name}`);
      console.log(`_id: ${result._id}`);
      console.log(`Bedrooms : ${result.bedrooms}`);
      console.log(`Bathrooms: ${result.bathrooms}`);
    });
  } else {
    console.log(
      `No listings found with at lest  ${minimumBedrooms} beddrooms and ${minimumBathrooms} bathrooms`
    );
  }
}

// Update database

async function updateListingByName(client, listingName, UpdatedListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne({ name: listingName }, { $set: UpdatedListing });

  console.log(`${result.matchedCount} document(s) matched the given criteria`);
  console.log(`${result.modifiedCount} document(s) were/was update`);
}

async function updateAllListingsToHavePropertyType(client) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateMany(
      { property_type: { $exists: false } },
      { $set: { property_type: "Unknown" } }
    );

  console.log(`${result.matchedCount} documents matched the criteria`);
  console.log(`${result.modifiedCount} document(s) were/was updated`);
}

async function upsertListingByName(client, listingName, UpdatedListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne(
      { name: listingName },
      { $set: UpdatedListing },
      { upsert: true }
    );

  console.log(`${result.matchedCount} document(s) matched the given criteria`);

  if (result.upsertedCount > 0) {
    console.log(`One document was inserted with the Id : ${result.upsertedId}`);
  } else {
    console.log(`${result.modifiedCount} document(s) were/was updated`);
  }
}

// Delete

async function deleteListingByName(client, listingName) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteOne({ name: listingName });

  console.log(`${result.deletedCount} document(s) was/were deleted`);
}

async function listDatabases(client) {
  const databaseList = await client.db().admin().listDatabases();

  console.log("Databases: ");
  databaseList.databases.forEach((db) => {
    console.log(`- ${db.name}`);
  });
}
