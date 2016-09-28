/**
 * Created by qcabrol on 9/23/16.
 */
"use strict"
const PouchDB = require("pouchdb");
const debug = require("debug")('main:pouchDB');

/********************************************************
 PouchDB related functions for DB entries
 *******************************************************/
function addPouchEntry(db, entry) {
    debug('trying to add a db entry');
    db.put(entry).then(function () { //define the response callback
        debug('Entry written in PouchDB:' + db);
    }).catch(function (err) {
        debug('Error on pouchDB write:' + err);
    })
}

//function exports
exports.addPouchEntry=addPouchEntry;

/*
 function getPouchEntry(db, id){

 }

 function getPouchLastEntry(db){

 }*/

