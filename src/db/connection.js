'use strict';

const MongoClient = require('mongodb').MongoClient;
const MONGO_DB_URL = 'mongodb://localhost:27017/arduino_devices';
let db = null;

module.exports = {
    async getCollection(collectionName) {
        await getDb();
        const collection = db.collection(collectionName);
        await collection.createIndex({epoch: -1, id: -1});
        return collection;
    },

    async getLastSeqId(collectionName) {
        const collection = await module.exports.getCollection(collectionName);
        const res = await collection.find({}).sort({epoch: -1, id: -1}).limit(1).toArray();
        console.log(res);
        if(!res.length) return 0;
        console.log(res[0].id);
        return res[0].id + 1;
    },

    async saveEntries(collectionName, entries) {
        console.log('save entries', entries.map(e => {
            return {
                id: e.id,
                epoch: e.epoch
            };
        }));
        const collection = await module.exports.getCollection(collectionName);
        await collection.insertMany(entries);
    }
};

async function getDb() {
    if(!db) {
        db = await MongoClient.connect(MONGO_DB_URL);
    }
    return db;
}