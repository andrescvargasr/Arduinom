/**
 * Created by qcabrol on 9/22/16.
 */
"use strict"
const Serialport = require("serialport");
const SerialDevices = require("./SerialDevices");
const SerialQueueManager = require("./SerialQueueManager");
const PouchDB = require("pouchdb");

var arduinoQManagers;
var arduinoDBList={};
var definedReadyListener={};

setInterval(()=> {
    arduinoQManagers = SerialDevices.serialDevicesHandler({manufacturer: 'Arduino_LLC'}, {init: 'q'}); //to be done, also call the init message 'q' here instead of the SerialDevices.js

    for (let key in arduinoQManagers) {
        //listen for the device answer to the init command
        if (!definedReadyListener[key]) {
            definedReadyListener[key]=true; //prevent multiple instances of the listener to be declared
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
                else{
                    console.log('rematching the database with the queue manager for device:' + arduinoQManagers[key].deviceId);
                    arduinoDBList[arduinoQManagers[key].deviceId].serialQ= arduinoQManagers[key];
                }
            });
        }

    }
}, 3000);


//listen to data event and send then to pouchdb