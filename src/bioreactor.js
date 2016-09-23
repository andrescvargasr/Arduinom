/**
 * Created by qcabrol on 9/22/16.
 */
"use strict"
const Serial = require("./SerialDevices");
const SerialQManager = require("./SerialQueueManager");
const PouchDB = require("pouchdb");

/**********************************************************************************
 * This file will have to be separated between pouch related generic functions and
 * device related ones (setEpoch, requireLog, requireMultiLog...)
 **********************************************************************************/
var bioreactorQManagers = {};
var bioreactorDBs = {};
var bioreactorCurrentLog={};

//need to add options here for pouchdb eg dbname, adapter, ajax... ++ remove the setinterval
setInterval(()=> {
    bioreactorQManagers = Serial.serialDevices({manufacturer: 'Arduino_LLC'}, {init: 'q', endString: '\n'}); //for it to be a bioreactor, need a condition on the qualifier value 'isbioreactor'
    bioreactorDBs = Serial.serialDBs();//should call dboptions here

    for (let key in bioreactorQManagers) {
        /*        if (bioreactorQManagers[key].ready) {
         _readCommand(bioreactorQManagers[key], 'e').then(function (buffer) {
         console.log('epoch is :' + buffer);
         }).catch(function (err) {
         console.log('getEpoch error' + err);
         });
         }*/

         /*if (bioreactorQManagers[key].ready) {
         _readCommand(bioreactorQManagers[key], 'm').then(function (buffer) {
         console.log(buffer);
         }).catch(function (err) {
         console.log('last id' + err);
         });
         }*/

        /*if (bioreactorQManagers[key].ready) {
         _readCommand(bioreactorQManagers[key], 'm0').then(function (buffer) {
         console.log(buffer);
         }).catch(function (err) {
         console.log('last id' + err);
         });
         }*/


        if (bioreactorQManagers[key].ready) {_retrieveLastSavedLog(bioreactorQManagers[key], bioreactorCurrentLog[key] || 0)
            .then((logs)=>{bioreactorCurrentLog[key]= logs;})
            .catch((err)=> {console.log('error on retrieve lastsaved log call', err)});

        console.log('current logID :', bioreactorCurrentLog[key]);
        }
    }
}, 3000);


/********************************************************
 Device Interface related functions
 *******************************************************/

//probably not useful
function _retrieveOldestLog(serialQ) {
    _readCommand(serialQ, 'm0').then(function (buffer) {
        var logs = buffer.split('\n')
        logs=_extractID(logs[0]);
        console.log('device: ', serialQ.deviceId);
        console.log('Oldest Flash log has entryID: ', logs);
        return logs;
    });

}

function _retrieveLastSavedLog(serialQ, currentLog){
    return _readCommand(serialQ, ('m'+(currentLog+1))).then(function (buffer) {
        var logs = buffer.split('\n')
        console.log(logs.length);
        logs=_extractID(logs[logs.length-2]); //first need to call the promise that write these logs in memory and check double check why the parsing is so strange
        console.log('device: ', serialQ.deviceId);
        console.log('Last DB Log is ',logs);
        return logs;
    });
}

//Send the epoch request command 'e' and read the value
function _readCommand(serialQ, cmd) {
    return serialQ.addRequest(cmd);
}

/***********************************
    Utilities, device dependent
 **********************************/
function _extractID(log){
    var id= log.substr(0,8);
    return parseInt(id, 32);
}

function _extractEpoch(log){
    var id= log.substr(8,8);
    return parseInt(id, 32);
}


/*
 function setEpoch(serialQ,epoch, param){
 serialQ.addRequest(`e${epoch}\n`);
 }

 function getLastID(serialQ){
 serialQ.addRequest('m')
 }

 function getLastLog(serialQ){

 }

 function getLastLogs(serialQ){

 }

 function getConfig(serialQ){

 }

 function setParameter(serialQ, value, param){

 }

 function getParameter(serialQ, param){

 }*/