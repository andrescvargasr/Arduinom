/**
 * Created by qcabrol on 9/23/16.
 */
"use strict"
const pouch = require("pouchdb");
pouch.plugin(require("pouchdb-find"));
const debug = require("debug")('main:pouchDB');
const parser = require("./parser");

/********************************************************
 PouchDB related functions for DB entries
 *******************************************************/
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


//get all entries related to one given device
function getPouchEntries(db, options) {
    return db.find({
            selector: {$kind: (options.devicetype || 'openspectro')},
            //fields: ['$kind'],
            limit: 15
        }
    ).then(res => {
        debug('pouch getter executed', res);
        return res;
    });
}


// document that tells PouchDB/CouchDB
// to build up an index on doc.$modificationDate for bioreactor devices
var ddocBioreactor = {
    _id: '_design/multilogs',
    views: {
        by_name: {
            map: function (doc) {
                if(doc.$kind!='bioreactor') return;
                emit(doc.$modificationDate); }.toString()
        }
    }
};

pouch.put(ddoc).then(function () {
    // success!
}).catch(function (err) {
    // some error (maybe a 409, because it already exists?)
});


// document that tells PouchDB/CouchDB
// to build up an index on doc.$modificationDate for openspectro
var ddocSpectro = {
    _id: '_design/multilogs',
    views: {
        by_name: {
            map: function (doc) {
                if(doc.$kind!='openspectro') return;
                emit(doc.$content.general.title); }.toString()
        }
    }
};

pouch.put(ddoc).then(function () {
    // success!
}).catch(function (err) {
    // some error (maybe a 409, because it already exists?)
});


//function exports
exports.parseAndSave = parseAndSave();
exports.getPouchEntries = getPouchEntries;