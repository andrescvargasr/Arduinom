'use strict';
const pouch = require('pouchdb');
pouch.plugin(require('pouchdb-find'));
const debug = require('debug')('main:pouchDB');
const parser = require('./parser');
var DB = new pouch('SerialData');


// PouchDB related functions for DB entries
function parseAndSaveToSerialData(data, cmd, options) {
    return parseAndSave(DB, data, cmd, options);
}

function parseAndSave(db, data, cmd, options) {

    var parsedData = parser.parse(cmd, data, options);
    for (let i = 0; i < parsedData.length; i++) {
        //return
        db.post(
            {
                $id: (options.id || Date.now()),
                $kind: (options.devicetype || 'openspectro'),
                $modificationDate: Date.now(),
                //manually entered title as option

                //output data of the experiment also containing device id
                $content: {
                    general: {
                        title: options.title,
                        description: options.description
                    },
                    misc: {
                        command: cmd,
                        qualifier: options.deviceId,
                        memEntry: options.memEntry,
                    },
                    data: parsedData[i]
                }
            }).then(function () { //define the response callback
                debug('Entry written in PouchDB:');
                return true;
            }).catch(function (err) {
                debug('Error on pouchDB write:' + err);
            });
    }
}

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
exports.parseAndSaveToSerialData = parseAndSaveToSerialData;
exports.parseAndSave = parseAndSave;
exports.getPouchEntriesSerialData = getPouchEntriesSerialData;
exports.getPouchEntries = getPouchEntries;
