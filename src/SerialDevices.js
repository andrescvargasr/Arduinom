"use strict"

//imported
const SerialPort = require("serialport");
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects
const pouchDB = require("pouchdb");
//user developed code
var util = require("./util");
const OpenBio = require("./devices/OpenBio");
const OpenSpectro = require("./devices/OpenSpectro");
//debug messages
const debug = require("debug")('main:serialdevices');

//polls the serial ports in search for an specific serial device every 3sec
var serialDBList = {};
var serialArray=[];
var serialDB = new pouchDB('serialData');
var ready;


/***********************************
 Manages Serial Devices
 Connection and Disconnections
 **********************************/





//to be put within the visualizer

function _initListeners(key){
    serialDBList[key].on('open', updateDevicesArray);
    serialDBList[key].on('close',updateDevicesArray);
    serialDBList[key].on('ready',updateDevicesArray);
    serialDBList[key].on('reinitialized',updateDevicesArray);
    serialDBList[key].on('disconnect', updateDevicesArray);
    serialDBList[key].on('error', updateDevicesArray);
}

function _disableListeners(key){
    serialDBList[key].off('open', updateDevicesArray);
    serialDBList[key].off('close',updateDevicesArray);
    serialDBList[key].off('ready',updateDevicesArray);
    serialDBList[key].off('reinitialized',updateDevicesArray);
    serialDBList[key].off('disconnect', updateDevicesArray);
    serialDBList[key].off('error', updateDevicesArray);
}




//send an array of all the devices
function updateDevicesArray() {
    refreshDevices({manufacturer: 'Arduino_LLC'}, {
        init: 'q',
        endString: '\r\n\r\n'
    }).then(()=> {
        var counter = 0;
        for (let key in serialDBList) {
            serialArray[counter] = {
                //add device type from factory sttings here
                id: util.deviceIdNumberToString(serialDBList[key].q),
                idValue: serialDBList[key].q,
                status: serialDBList[key].serialQ.status,
                statusColor: serialDBList[key].serialQ.statusColor,
            };
            counter++;
        }
        debug('devices array updated');
    });
}


exports.getDevicesArray = getDevicesArray; //return the array of all the connected devices
exports.updateDevicesArray = updateDevicesArray; //return the array of all the connected devices

