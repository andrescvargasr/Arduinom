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
var d = new Date();
var n = d.getTime();

function addPouchEntry(db, entry, cmd, options) {
    n=d.getTime();
    n=n.toString();
    var parsedEntry= parser.parse(cmd, entry, options);
    db.put({_id: (options.filename || {n}), parsedEntry}).then(function () { //define the response callback
        debug('Entry written in PouchDB:');
        return true;
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

