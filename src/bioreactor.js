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
var testQueue=false;
var bioreactorQManagers;
var bioreactorDBs;

//need to add options here for pouchdb eg dbname, adapter, ajax...
setInterval(()=> {

        bioreactorQManagers=Serial.serialDevices({manufacturer: 'Arduino_LLC'}, {init: 'q', endString: '\n'});
        bioreactorDBs=Serial.serialDBs();//should call dboptions here

    for (let key in bioreactorQManagers) {
        if (bioreactorQManagers[key].ready) {
            readCommand(bioreactorQManagers[key], 'e').then(function (buffer) {
                console.log('epoch is :' + buffer);
            }).catch(function (err) {
                console.log('getEpoch error' + err);
            });
        }

        if (bioreactorQManagers[key].ready) {
            readCommand(bioreactorQManagers[key], 's').then(function (buffer) {
                console.log(buffer);
            }).catch(function (err) {
                console.log('last id' + err);
            });
        }

        if (!testQueue) {
            testQueue = true;
            for (var j = 0; j < 20; j++) {
                if (bioreactorQManagers[key].ready) {
                    readCommand(bioreactorQManagers[key], 'e').then(function (buffer) {
                        console.log('epoch is :' + buffer);
                    }).catch(function (err) {
                        console.log('getEpoch error' + err);
                    });
                }

            }
        }
    }

}, 5000);




/*
function getPouchEntry(db, id){

}

function getPouchLastEntry(db){

}*/

/********************************************************
   Device Interface related functions for DB entries
 *******************************************************/
/*
function setAndCheck(serialQ, funSet, funCheck, value, param){
    funSet(serialQ, value, param);
    return (funCheck(serialQ,param)=== value); //or success messsage
}
*/
//Send the epoch request command 'e' and read the value
function readCommand(serialQ, cmd){
    return serialQ.addRequest(cmd);
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