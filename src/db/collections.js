'use strict';

const Mongo = require('./mongodb/Mongo');
const collections = {};
module.exports = async function getCollection(deviceID) {
    if (collections[deviceID]) return collections[deviceID];
    const collection = new Mongo(deviceID);
    await collection.init();
    collections[deviceID] = collection;
    return collection;
};
