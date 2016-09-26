"use strict"
//usermod -a -G dialout quentin + newgrp dialout ---> for serial port access rights
//exports = fonction / objet / class etc... --> permet de faire un require du fichier
//ctrl alt + l  for auto indent

const SerialPort = require("serialport"); //constructor for serial port objects
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects
const PouchDB = require("pouchdb");

//polls the serial ports in search for an specific serial device every 3sec
var selectedPorts;
var serialQManagers = {};
var serialDBList = {};
var ready=serialDBs();


//return promise of a serialQobject with given id
function getDB(id) {
    return ready.then(()=> {
        if(serialDBList[id]) return serialDBList[id].db;
        else throw new Error('no existing device with ID', id);
    })
}


//return promise of q SerialDB objectwith fiven ID
function getSerialQ(id) {
    return ready.then(()=> {
        if(serialDBList[id]) return serialDBList[id].serialQ;
        else throw new Error('no existing device with ID', id);
    })
}


function refreshSerialDevices(options, initialize, dboptions) {
    serialDevices(options, initialize);
//    return //, refreshSerialDevices); --> need to call refresh with a timeout
}

/***********************************
 Manages Serial Devices
 DB creation or binding
 **********************************/
//add options here for pouchdb eg dbname, adapter, ajax...
function serialDBs(dbOptions) {
    var arr=[];
    for (let key in serialQManagers) {
        arr.push(new Promise (function(resolve){
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
                resolve();
            });
        }))
    }
    return Promise.all(arr);//must return a promise
}

/***********************************
 Manages Serial Devices
 Connection and Disconnections
 **********************************/
function serialDevices(options, initialize,dboptions) {
    SerialPort.list(function (err, ports) {
        selectedPorts = ports.filter(function (port) {
            for (var key in options) {
                if (port[key] !== options[key])
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
            }
        });
        serialDBs(dboptions);
    });
    return serialQManagers;
}


//function exports
exports.serialDBs = serialDBs;
exports.serialDevices = serialDevices;
