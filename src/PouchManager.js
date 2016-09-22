/**
 * Created by qcabrol on 9/22/16.
 */
"use strict"
const SerialDevices = require("./SerialDevices");
const PouchDB = require("pouchdb");

/**********************************************************************************
 * This file will have to be separated between pouch related generic functions and
 * device related ones (setEpoch, requireLog, requireMultiLog...)
 **********************************************************************************/
var arduinoQManagers;
var arduinoDBList = {};
var definedReadyListener = {};


//need to add options here for pouchdb eg dbname, adapter, ajax...
setInterval(()=> {
    arduinoQManagers = SerialDevices.serialDevicesHandler({manufacturer: 'Arduino_LLC'}, {init: 'q'}); //to be done, also call the init message 'q' here instead of the SerialDevices.js

    for (let key in arduinoQManagers) {
        //prevent multiple instances of the listener to be declared --> to be removed with the setinterval later
        if (!definedReadyListener[key]) {
            definedReadyListener[key] = true;
            //listen when the device has answered the init command
            arduinoQManagers[key].on('ready', () => {
                //create a db linked to the deviceId if not existing
                if (!arduinoDBList[arduinoQManagers[key].deviceId]) {
                    arduinoDBList[arduinoQManagers[key].deviceId] = {
                        q: arduinoQManagers[key].deviceId,
                        db: new PouchDB('arduino' + arduinoQManagers[key].deviceId),
                        serialQ: arduinoQManagers[key]
                    };
                    console.log('creating a database for device:' + arduinoQManagers[key].deviceId);
                }


                else {
                    console.log('rematching the database with the queue manager for device:' + arduinoQManagers[key].deviceId);
                    arduinoDBList[arduinoQManagers[key].deviceId].serialQ = arduinoQManagers[key];
                }
            });
        }


        //test for requests
        if(arduinoQManagers[key].ready) {readCommand(arduinoQManagers[key],'e').then(function(buffer){
            console.log('epoch is :'+ buffer);
        }).catch(function(err){
            console.log('getEpoch error' + err);
        });}

        if(arduinoQManagers[key].ready) {readCommand(arduinoQManagers[key],'s').then(function(buffer){
            console.log(buffer);
        }).catch(function(err) {
            console.log('last id' + err);
        });}
    }

}, 5000);


/********************************************************
        PouchDB related functions for DB entries
 *******************************************************/
/*
function addPouchEntry(db, id, epoch, log, event) {

    db.put({_id: id, _epoch: epoch, _log: log, _event: event}).then(function (response) { //define the response callback
        console.log('Entry written in PouchDB:' + id);
    }).catch(function (err) {
        console.log('Error on pouchDB write:' + err);
    })
}

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