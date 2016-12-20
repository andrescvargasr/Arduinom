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
    return db.post(
        {
            $id: (options.id || Date.now()),
            $kind: (options.devicetype || 'OpenSpectro'),
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
        })
        .then(function (result) { //define the response callback
            debug('Entry written in PouchDB: \n' + result.id);
            return result;
        });
}


// document that tells PouchDB/CouchDB
// to build up an index on doc.name
var ddocBioreactors = {
    _id: '_design/bioreactors',
    views: {
        by_mem: {
            map: function (doc) {
                if (doc.$kind === 'OpenBio') {
                    //then add values for temp, weight, ...(only keys for know) //remove the .data and emit only what is needed to make the request faster
                    emit([doc.$content.misc.qualifier, doc.$content.misc.memEntry], doc.$content.data); // eslint-disable-line no-undef
                }
            }.toString()
        }
    }
};
// save it
DB.get(ddocBioreactors._id).then((doc)=> {
    ddocBioreactors._rev = doc._rev; //in the future would be nice to support ddoc update using put with the correct rev number
    debug('ddocBioreactors already exists with rev:' + doc._rev);
    return getDeviceDB('bioreactors/by_mem');
}, (err)=> {
    if (err.reason === 'missing') {
        DB.put(ddocBioreactors).then(()=> {
            getDeviceDB('bioreactors/by_mem');
        }).catch(function (err) {
            debug(`Failed to update bioreactor design doc: ${err.message}`);
        });
    }
});

var ddocSpectros = {
    _id: '_design/spectros',
    views: {
        by_id: {
            map: function (doc) {
                if (doc.$kind === 'OpenSpectro') {
                    //then add values for temp, weight, ...(only keys for know) //remove the .data and emit only what is needed to make the request faster
                    emit([doc.$content.misc.qualifier, doc.$modificationDate], doc.$content.data); // eslint-disable-line no-undef
                }
            }.toString()
        }
    }
};
// save it
DB.get(ddocSpectros._id).then((doc)=> {
    ddocSpectros._rev = doc._rev; //in the future would be nice to support ddoc update using put with the correct rev number
    debug('ddocSpectros already exists with rev:' + doc._rev);
    getDeviceDB('spectros/by_id');
}, (err)=> {
    if (err.reason === 'missing') {
        DB.put(ddocSpectros).then(()=> {
            getDeviceDB('spectros/by_id');
        }).catch(function (err) {
            debug(`Failed to update spectro design doc: ${err.message}`);
        });
    }
});


//getter
function getDeviceDB(str, id) {
    //queries to
    if (id == null) {
        return DB.query(str, {
            limit: 20, include_docs: false
        }).then(function (result) {
            debug('query resolved properly on :' + str);
            return result;
        });
    }    else {
        return DB.query(str, {
            startkey: [id, Number.MAX_SAFE_INTEGER], endkey: [id, 0], limit: 20, descending: true, include_docs: false
        }).then(function (result) {
            debug('query resolved properly on :' + str);
            debug(result);
            return result;
        });}
}

function getLastInDB(id) {
    debug('serving last In DB for id:' + id);
    return DB.query('bioreactors/by_mem', {
        startkey: [id, Number.MAX_SAFE_INTEGER], endkey: [id, 0], limit: 1, include_docs: false, descending: true
    }).then(function (result) {
        debug(result);
//        debug(result.rows[0].key);
        return result;
    });
}

//function exports
exports.saveToSerialData = saveToSerialData;
exports.saveToDB = saveToDB;
exports.getDeviceDB = getDeviceDB;
exports.getLastInDB = getLastInDB;
