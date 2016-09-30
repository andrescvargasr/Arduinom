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
function addPouchEntry(db, entry, cmd, options) {
    var d = new Date();
    var n = d.getTime();
    n = n.toString();
    debug('time is', n);
    var parsedEntry = parser.parse(cmd, entry, options);
    return db.post(
        {
            $id: (options.id || n),
            $kind: (options.devicetype || 'openspectro'),
            //manually entered title as option
            general: {
                title: options.title,
                description: options.description
            },
            //output data of the experiment also containing device id
            $content: {
                qualifier: options.deviceId,
                epoch: (options.epoch || n),
                memEntry: options.memEntry,
                data: parsedEntry
            }
        }).then(function () { //define the response callback
        debug('Entry written in PouchDB:');
        return true;
    }).catch(function (err) {
        debug('Error on pouchDB write:' + err);
    });
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


//function exports
exports.addPouchEntry = addPouchEntry;
exports.getPouchEntries = getPouchEntries;