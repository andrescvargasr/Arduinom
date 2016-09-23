"use strict"
//usermod -a -G dialout quentin + newgrp dialout ---> for serial port access rights
//exports = fonction / objet / class etc... --> permet de faire un require du fichier
//ctrl alt + l  for auto indent

const SerialPort = require("serialport"); //constructor for serial port objects
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects
const PouchDB = require("pouchdb");

//polls the serial ports in search for an specific serial device every 3sec
var selectedPorts;
var serialQManagers={};
var serialDBList = {};
var definedReadyListener = {};

/***********************************
 Manages Serial Devices
 DB creation or binding
 **********************************/
//add options here for pouchdb eg dbname, adapter, ajax...
function serialDBs(dbOptions){
    for (let key in serialQManagers) {
        //prevent multiple instances of the listener to be declared --> to be removed with the setinterval later
        if (!definedReadyListener[key]) {
            definedReadyListener[key] = true;
            serialQManagers[key].on('ready', () => {
                //create a db linked to the deviceId if not existing
                if (!serialDBList[serialQManagers[key].deviceId]) {
                    serialDBList[serialQManagers[key].deviceId] = {
                        q: serialQManagers[key].deviceId,
                        db: new PouchDB('deviceId' + serialQManagers[key].deviceId),
                        serialQ: serialQManagers[key]
                    };
                    console.log('creating a database for device:' + serialQManagers[key].deviceId);
                }

                else {
                    console.log('rematching the database with the queue manager for device:' + serialQManagers[key].deviceId);
                    serialDBList[serialQManagers[key].deviceId].serialQ = serialQManagers[key];
                }
            });
        }
    }
    return serialDBList;
}

/***********************************
 Manages Serial Devices
 Connection and Disconnections
 **********************************/
function serialDevices(options, initialize) {
    SerialPort.list(function (err, ports) {
        selectedPorts = ports.filter(function (port) {
            for(var key in options){
                if(port[key]!==options[key])
                    return false
            }
            return true; //return port infos if true (boolean for filter method)
        });

        selectedPorts.forEach(function (port) {
            if (!serialQManagers[port.comName]) {
                //create new serial Queue manager if a new serial device was connected
                serialQManagers[port.comName] = new SerialQueueManager(port.comName, {
                        baudRate: 38400,
                        parser: SerialPort.parsers.raw
                    },
                    {
                        init: initialize.init,
                        endString: initialize.endString
                    });

                serialQManagers[port.comName].port.on('idchange', err => {
                    if (err) return console.log('ERR on idchange event:' + err.message);
                    console.log('device id changed, deleting serial queue manager' + port.comName);
                    delete serialQManagers[port.comName];
                });
                //add event listener for change in id and destroy the object accordingly then create a new one with the correct por call
            }
        });
    });
    return serialQManagers;
}


//function exports
exports.serialDBs = serialDBs;
exports.serialDevices = serialDevices;
