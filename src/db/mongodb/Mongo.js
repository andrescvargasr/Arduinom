'use strict';

const debug = require('debug')('arduimon:db:sync');
const MongoClient = require('mongodb').MongoClient;
const MONGO_DB_URL = 'mongodb://localhost:27017/arduino_devices';

class Mongo {
    constructor(deviceID) {
        this.db = null;
        this.collection = null;
        this.initialized = false;
        this.deviceID = deviceID;
    }

    async drop() {
        await this.init();
        this.collection.drop();
        await this.init();
    }

    async init() {
        if (this.initialized) return;
        if (!this.db) {
            this.db = await MongoClient.connect(MONGO_DB_URL);
        }
        this.collection = this.db.collection(`device${this.deviceID}`);
        await this.collection.createIndex('epoch', {epoch: -1, id: -1});
        this.initialized = true;
    }

    async getAllEntries() {
        await this.init();
        return this.collection.find({}).sort({id: 1}).toArray();
    }

    async getLastSequenceId() {
        await this.init();
        const res = await this.collection.find({}).sort({id: -1}).limit(1).toArray();
        debug('Answer to getLastSequenceId', res);
        if (!res.length) return 0;
        return res[0].id;
    }

    async getNumberEntries() {
        await this.init();
        const res = await this.collection.count();
        debug('Answer to getNumberEntries', res);
        return res;
    }

    async saveEntries(entries) {
        await this.init();
        await this.collection.insertMany(entries);
    }

    async getEntries(options) {
        options = Object.assign({
            limit: 200,
            parameters: 'A,B,C,D'
        }, options);
        const parameters = options.parameters.split(',');
        const projection = {_id: 0, event: 1, eventValue: 1, epoch: 1, id: 1};
        parameters.forEach(p => projection[`parameters.${p}`] = 1);
        if (options.sort === 'desc') {
            var sort = {epoch: -1, id: -1};
        } else {
            sort = {epoch: 1, id: 1};
        }
        return this.collection.find({}, projection).sort(sort).limit(parseInt(options.limit)).toArray();
    }
}

module.exports = Mongo;
