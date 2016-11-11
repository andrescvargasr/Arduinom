'use strict';
const pouch = require('pouchdb');
pouch.plugin(require('pouchdb-find'));
const debug = require('debug')('main:pouchDB');
const parser = require('./parser');
var DB = new pouch('SerialData');


// PouchDB related functions for DB entries
function saveToSerialData(data, options) {
    return saveToDB(DB, data, options);
}

function saveToDB(db, data, options) {
    for (let i = 0; i < data.length; i++) {
        //return
        db.post(
            {
                $id: (options.id || Date.now()),
                $kind: (options.devicetype || 'openspectro'),
                $modificationDate: Date.now(),
                $content: {
                    general: {
                        title: options.title,
                        description: options.description
                    },
                    misc: {
                        command: options.cmd,
                        qualifier: options.deviceId,
                        memEntry: options.memEntry,
                    },
                    data: data[i]
                }
            }).then(function () { //define the response callback
            debug('Entry written in PouchDB:');
            return true;
        }).catch(function (err) {
            debug('Error on pouchDB write:' + err);
        });
    }
}


//getter
function getPouchEntriesSerialData(options) {
    return getPouchEntries(DB, options);
}

//get all entries related to one given device
function getPouchEntries(db, options) {
    return db.find({
        selector: {$kind: (options.devicetype || 'openspectro'),
                    },
            //fields: ['$kind'],
        limit: 15
    }
    ).then(res => {
        debug('pouch getter executed', res);
        return res;
    });
}

//function exports
exports.saveToSerialData = saveToSerialData;
exports.saveToDB = saveToDB;
exports.getPouchEntriesSerialData = getPouchEntriesSerialData;
exports.getPouchEntries = getPouchEntries;
