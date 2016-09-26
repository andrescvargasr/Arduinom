/**
 * Created by qcabrol on 9/26/16.
 */
/**
 * Created by qcabrol on 9/22/16.
 */
"use strict"
const Serial = require("./SerialDevices");
const SerialQManager = require("./SerialQueueManager");
const PouchDB = require("pouchdb");




class openSpectro extends EventEmitter { //issue with extends EventEmitter
    constructor(id) {
        this.SerialQ= Serial.getDevice(id)

    }


/**********************************************************************************
 * This file will have to be separated between pouch related generic functions and
 * device related ones (setEpoch, requireLog, requireMultiLog...)
 **********************************************************************************/
var bioreactorQManagers = {};
var bioreactorDBs = {};

//need to add options here for pouchdb eg dbname, adapter, ajax... ++ remove the setinterval
setInterval(()=> {
    bioreactorQManagers = Serial.serialDevices({manufacturer: 'Arduino_LLC'}, {init: 'q', maxQlength: 20, endString: '\r\n\r\n'}); //for it to be a bioreactor, need a condition on the qualifier value 'isbioreactor'
    bioreactorDBs = Serial.serialDBs();//should call dboptions here

    for (let key in bioreactorQManagers) {
        if (bioreactorQManagers[key].ready) {
         _readCommand(bioreactorQManagers[key], 'a').then(function (buffer) {
         console.log('qualifier is :' + buffer);
         }).catch(function (err) {
         console.log('getQualifier error' + err);
         });
         }

    }
}, 3000);


/********************************************************
 Device Interface related functions
 *******************************************************/

//Send the epoch request command 'e' and read the value
function _readCommand(serialQ, cmd) {
    return serialQ.addRequest(cmd);
}


function addTemperature(){

}