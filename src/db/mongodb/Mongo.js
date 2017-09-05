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
        if (this.collection) {
            await this.collection.drop();
        }
    }

    async init() {
        if (!this.db) {
            debug(`create mongo connection and initialize collection (${this.deviceID})`);
            this.db = await MongoClient.connect(MONGO_DB_URL);
            this.collection = this.db.collection(`device${this.deviceID}`);
            // Create the index if it does not exist
            await this.collection.createIndex({epoch: -1, id: -1});
        }
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

    /**
     *
     * @param options
     * @param options.parameters : comma separated list of parameters
     * @returns {Promise}
     */
    async getEntries(options = {}) {
        options = Object.assign({
            limit: 200,
            sort: 'desc',
            fromEpoch: 0,
            toEpoch: Number.MAX_SAFE_INTEGER,
            fromID:0,
            toID: Number.MAX_SAFE_INTEGER,
            count: false
        }, options);



        const projection = '';
        if (options.parameters) {
            const parameters = options.parameters.split(',');
            projection = {_id: 0, event: 1, eventValue: 1, epoch: 1, id: 1};
            parameters.forEach(p => projection[`parameters.${p}`] = 1);
        }
        var sort = {epoch: 1, id: 1};
        if (options.sort === 'desc') {
            sort = {epoch: -1, id: -1};
        }
        var find = [];
        if (options.fromEpoch) {
            find.push({"epoch": {$gt: Number(options.fromEpoch)}});
        }
        if (options.toEpoch) {
            find.push({"epoch": {$lt: Number(options.toEpoch)}});
        }
        if (options.fromID) {
            find.push({"id": {$gt: Number(options.fromID)}});
        }
        if (options.toID) {
            find.push({"id": {$lt: Number(options.toID)}});
        }
        find = {$and: find};

        debug('query parameters', JSON.stringify(find));

        var results = await this.collection.find(find, projection).sort(sort).limit(parseInt(options.limit)).toArray();

        debug('number of results', results.length);

        return results;
    }
}

module.exports = Mongo;
