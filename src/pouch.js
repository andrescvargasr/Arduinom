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


// document that tells PouchDB/CouchDB
// to build up an index on doc.name
var ddocBioreactors = {
    _id: '_design/bioreactors',
    views: {
        by_id: {
            map: function (doc) {
                if (doc.$kind === 'bioreactor') {
                    //then add values for temp, weight, ...(only keys for know) //remove the .data and emit only what is needed to make the request faster
                    emit([doc.$content.misc.qualifier, doc.$modificationDate], doc.$content.data);
                }
            }.toString()
        }
    }
};
// save it
DB.put(ddocBioreactors).then(function () {
    // success!
}).catch(function (err) {
    // some error (maybe a 409, because it already exists?)
});



var ddocSpectros = {
    _id: '_design/spectros',
    views: {
        by_id: {
            map: function (doc) {
                if (doc.$kind === 'openspectro') {
                    //then add values for temp, weight, ...(only keys for know) //remove the .data and emit only what is needed to make the request faster
                    emit([doc.$content.misc.qualifier, doc.$modificationDate], doc.$content.data);
                }
            }.toString()
        }
    }
};
// save it
DB.put(ddocSpectros).then(function () {
    // success!
}).catch(function (err) {
    // some error (maybe a 409, because it already exists?)
});


//getter
function getDeviceDB(ddoc, id) {
        // some error
    //queries to pouch
    return DB.query(ddoc, {
        startkey: [id, 0], endkey: [id, Number.MAX_SAFE_INTEGER], limit: 5, include_docs: false
    }).then(function (result) {
        debug('query resolved properly');
        return result;
    });
}

//function exports
exports.saveToSerialData = saveToSerialData;
exports.saveToDB = saveToDB;
exports.getDeviceDB = getDeviceDB;
