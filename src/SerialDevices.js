"use strict"
//usermod -a -G dialout quentin + newgrp dialout ---> for serial port access rights
//exports = fonction / objet / class etc... --> permet de faire un require du fichier
//ctrl alt + l  for auto indent

const SerialPort = require("serialport"); //constructor for serial port objects
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects
const pouchDB = require("pouchdb");
const debug = require("debug")('main:serialdevices');

//polls the serial ports in search for an specific serial device every 3sec
var selectedPorts;
var serialQManagers = {};
var serialDBList = {};
var serialDB = new pouchDB('serialData');
var ready;
var serialQListener = {};


//return promise of a serialQ object with given id
function getDB(id) {
    debug('getting serialDB for device', id);
    return ready.then(()=> {
        debug('resolved getDB');
        if (serialDBList[id]) {
            return serialDBList[id].db;
        }
        else throw new Error('no existing db for device with ID:' + id);
    })
}


//return promise of q serialDB object with given ID
function getSerialQ(id) {
    debug('getting serialQ for device', id);
    return ready.then(()=> {
        debug('resolved get serialQ');
        if (serialDBList[id]) {
            return serialDBList[id].serialQ;
        }
        else throw new Error('no existing device with ID: ' + id);
    })
}


function refreshDevices(options, initialize, dboptions) {
    ready = serialDevices(options, initialize, dboptions);
    return ready;
}

/***********************************
 Manages Serial Devices
 Connection and Disconnections
 **********************************/
function serialDevices(options, initialize, dboptions) {
    return new Promise(function (resolve, reject) {
        SerialPort.list(function (err, ports) {
            if (err) return reject(err);
            var arr = [];
            selectedPorts = ports.filter(function (port) {
                for (var key in options) {
                    if (port[key] !== options[key])
                        return false
                }
                return true; //return port infos if true (boolean for filter method)
            });

            selectedPorts.forEach(function (port) {

                debug('device with desired specs detected on port :', port.comName);

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
                    debug('created new SerialQManager');

                    arr.push(new Promise(function (resolve) {
                        if (!serialQListener[port.comName]) {
                            serialQListener[port.comName] = true;
                            debug('Serial devices ready listener for device', port.comName);
                            serialQManagers[port.comName].on('ready', () => {
                                debug('serialQManager ready event');
                                //create a db linked to the deviceId if not existing
                                serialDBList[serialQManagers[port.comName].deviceId] = {
                                    q: serialQManagers[port.comName].deviceId,
                                    db: serialDB, //--> same db for all
                                    serialQ: serialQManagers[port.comName]
                                };
                                debug('linking database to device:' + serialQManagers[port.comName].deviceId);
                                resolve();
                            });
                            serialQManagers[port.comName].on('reinitialized', () => {
                                debug('rematching the database with the queue manager for device:' + serialQManagers[port.comName].deviceId);
                                serialDBList[serialQManagers[port.comName].deviceId].serialQ = serialQManagers[port.comName];
                                resolve();

                            });
                            serialQManagers[port.comName].on('idchange', (newId, oldId) => {
                                debug('device id changed, on port' + port.comName); //seems it is not doing the proper job
                                delete serialDBList[oldId];
                                debug('old DBlist is ' + serialDBList[oldId]);
                                serialDBList[newId] = {
                                    q: newId,
                                    db: serialDB, //--> same db for all
                                    serialQ: serialQManagers[port.comName]
                                };
                                debug('new DBlist is ' + serialDBList[newId]);


                            });
                        }
                    }))


                }
            });
            Promise.all(arr).then(()=> {
                resolve(serialDBList);
            });

        });
    });
}


//function exports
exports.getSerialQ = getSerialQ;
exports.getDB = getDB;
exports.refreshDevices = refreshDevices;
