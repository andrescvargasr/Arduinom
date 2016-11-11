'use strict';
const pouch = require('pouchdb');
pouch.plugin(require('pouchdb-find'));
const debug = require('debug')('main:pouchDB');
var DB = new pouch('SerialData');


// PouchDB related functions for DB entries
function saveToSerialData(data, options) {
    return saveToDB(DB, data, options);
}

function saveToDB(db, data, options) {
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
                data: data
            }
        }).then(function () { //define the response callback
        debug('Entry written in PouchDB:');
        return true;
    }).catch(function (err) {
        debug('Error on pouchDB write:' + err);
    });
}


//map functions for each device type
function mapBioreactors(doc) {
    if (doc.$kind === 'bioreactor') {
        //then add values for temp, weight, ...(only keys for know) //remove the .data and emit only what is needed to make the request faster
        emit([doc.$content.misc.qualifier, doc.$modificationDate], doc.$content.data);
    }
}

function mapSpectros(doc) {
    if (doc.$kind === 'openspectro') {
        emit([doc.$content.misc.qualifier, doc.$modificationDate],doc.$content.data);
    }
}


//getter
function getDeviceDB(map, id) {
    //queries to pouch
    return pouch.query(map, {
        startkey: [id, 0 ], endkey: [id, Number.MAX_SAFE_INTEGER ], limit: 5, include_docs: false
    }).then(function (result) {
        // handle result
        return result;
    }).catch((err)=>{return Promise.reject(new Error('error getting pouchDB logs' + err.message))});
}


//function exports
exports.saveToSerialData = saveToSerialData;
exports.saveToDB = saveToDB;

exports.getDeviceDB = getDeviceDB;
exports.mapSpectros = mapSpectros;
exports.mapBioreactors = mapBioreactors;