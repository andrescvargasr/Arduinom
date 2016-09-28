/**
 * Created by qcabrol on 9/23/16.
 */
"use strict"
const pouch = require("pouchdb");
const debug = require("debug")('main:pouchDB');
const parser= require("./parser");

/********************************************************
 PouchDB related functions for DB entries
 *******************************************************/

function addPouchEntry(db, entry, cmd, options) {
    var parsedEntry= parser.parse(cmd, entry, options);
    db.put({_id: (options.filename || {}), parsedEntry}).then(function () { //define the response callback
        debug('Entry written in PouchDB:');
    }).catch(function (err) {
        debug('Error on pouchDB write:' + err);
    });
}

//function exports
exports.addPouchEntry=addPouchEntry;

/*
 function getPouchEntry(db, id){

 }

 function getPouchLastEntry(db){

 }*/

