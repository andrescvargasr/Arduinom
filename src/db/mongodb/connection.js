'use strict';

const MongoClient = require('mongodb').MongoClient;
const MONGO_DB_URL = 'mongodb://localhost:27017/arduino_devices';
let db = null;

const getEntriesDefaultOptions = {
    limit: 200,
    parameters: 'A,B,C,D'
};

module.exports = {
    async getDatabase(collectionName) {
        await getDb();
        const collection = db.collection(`device${collectionName}`);
        await collection.createIndex({epoch: -1, id: -1});
        return collection;
    },

    async getLastSeqId(collectionName) {
        const collection = await module.exports.getDatabase(collectionName);
        const res = await collection.find({}).sort({epoch: -1, id: -1}).limit(1).toArray();
        if (!res.length) return 0;
        return res[0].id + 1;
    },

    async saveEntries(collectionName, entries) {
        const collection = await module.exports.getDatabase(collectionName);
        await collection.insertMany(entries);
    },

    async getEntries(collectionName, options) {
        options = Object.assign({}, getEntriesDefaultOptions, options);
        const parameters = options.parameters.split(',');
        const projection = {_id: 0, event: 1, eventValue: 1, epoch: 1, id: 1};
        parameters.forEach(p => projection[`parameters.${p}`] = 1);
        if(options.sort === 'desc') {
            var sort = {epoch: -1, id: -1};
        } else {
            sort = {epoch: 1, id: 1};
        }
        const collection = await module.exports.getDatabase(collectionName);
        return await collection.find({}, projection).sort(sort).limit(parseInt(options.limit)).toArray();
    }
};

async function getDb() {
    if (!db) {
        db = await MongoClient.connect(MONGO_DB_URL);
    }
    return db;
}
