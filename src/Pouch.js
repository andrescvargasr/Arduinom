/**
 * Created by qcabrol on 9/23/16.
 */
"use strict"
const PouchDB = require("pouchdb");

/********************************************************
 PouchDB related functions for DB entries
 *******************************************************/
function addPouchEntry(db, entry) {
    db.put(entry).then(function (response) { //define the response callback
        console.log('Entry written in PouchDB:' + id);
    }).catch(function (err) {
        console.log('Error on pouchDB write:' + err);
    })
}

//function exports
exports.addPouchEntry=addPouchEntry;