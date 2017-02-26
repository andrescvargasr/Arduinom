'use strict';

const MongoClient = require('mongodb').MongoClient;
const baseUrl = 'mongodb://localhost:27017/';
const dbs = {};
module.exports = {
    async getDb(dbName) {
        if(dbs[dbName]) return dbs[dbName];
        else {
            const db = MongoClient.connect(`${baseUrl}${dbName}`);
            dbs[dbName] = db;
            return db;
        }
    },

    async getCollection(collectionName) {
        await module.exports.getDb('devices');
        return db.collection(collectionName);
    },

    async getLastSeqId(collectionName) {
        const collection = module.exports.getCollection(collectionName);
        const res = collection.find({}).sort({seqId: -1}).limit(1).toArray();
        if(!res.length) return 0;
        return res[0].seqId;
    }
};