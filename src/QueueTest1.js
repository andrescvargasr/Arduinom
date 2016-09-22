/**
 * Created by qcabrol on 9/22/16.
 */
"use strict"
const SerialDevices = require("./SerialDevices");
const SerialQueueManager = require("./SerialQueueManager");
const PouchDB = require("pouchdb");

var arduinoQManagers;
var arduinoDBList;

setInterval(()=> {
    arduinoQManagers = SerialDevices.serialDevicesHandler({manufacturer: 'Arduino_LLC'},{init:'q'}); //to be done, also call the init message 'q' here instead of the SerialDevices.js
    for (let i = 0; i < arduinoQManagers.length; i++) {
        //listen for the device answer to the init command
        arduinoQManagers[i].port.on('ready', (deviceId) => {
            //create a db linked to the deviceId if not existing
            if(!arduinoDBList[deviceId]);
            arduinoDBList[deviceId] = {
                q: deviceId,
                db: new PouchDB('arduino' + deviceId),
                serialQ: arduinoQManagers[i]
            }
            //if a DB linked to the deviceID already exists, only refresh the serialQManager object it is pointing to
            else{
                arduinoDBList[i].serialQ= arduinoQManagers[i];
            }
        });

    }
}, 3000);


//listen to data event and send then to pouchdb