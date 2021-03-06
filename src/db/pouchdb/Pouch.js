'use strict';

const debug = require('debug')('arduimon:db:sync');
const PouchDB = require('pouchdb');

class Pouch {
    constructor(deviceID, options = {}) {
        if (options.adapter === 'memory') {
            PouchDB.plugin(require('pouchdb-adapter-memory'));
        }
        this.db = new PouchDB(`device${deviceID}`, options);
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        let info = await this.db.info();
        debug('Info from db', info);
        if (!info.doc_count) {
            debug('Adding design docs');
            await addDesignDoc(this.db);
        }
        this.initialized = true;
    }

    async getAllEntries() {
        await this.init();
        return (await this.db.allDocs({
            include_docs: true
        })).rows;
    }

    async getLastSequenceId() {
        await this.init();
        let rows = (await this.db.query('my_index/id_max')).rows;
        debug('Answer to getLastSequenceId', rows);
        switch (rows.length) {
            case 0:
                return 0;
            case 1:
                return rows[0].value;
            default:
                throw new Error('No last seq ID');
        }
    }

    async getNumberEntries() {
        await this.init();
        let rows = (await this.db.query('my_index/number_entries')).rows;
        switch (rows.length) {
            case 0:
                return 0;
            case 1:
                return rows[0].value;
            default:
                throw new Error('No correct design doc');
        }
    }

    async saveEntries(entries) {
        await this.init();
        await this.db.bulkDocs(entries);
    }

    async getEntries(options = {}) {
        /*
        startKey
        endKey
        limit
        skip
        key
        keys
         */
        let realOptions = Object.assign({}, options, {
            include_docs: true
        });
        await this.init();
        return this.db.allDocs(realOptions);
    }
}


async function addDesignDoc(db) {
    let designDoc = {
        _id: '_design/my_index',
        views: {
            id_max: {
                map: function (doc) {
                    emit(null, doc.id); // eslint-disable-line no-undef
                }.toString(),
                reduce: function (key, values) {
                    return Math.max.apply(null, values);
                }.toString()
            },
            number_entries: {
                map: function () {
                    emit(null); // eslint-disable-line no-undef
                }.toString(),
                reduce: '_count'
            }
        }
    };
    db.put(designDoc);
}

module.exports = Pouch;
