"use strict"
//usermod -a -G dialout quentin + newgrp dialout ---> for serial port access rights
//exports = fonction / objet / class etc... --> permet de faire un require du fichier
//ctrl alt + l  for auto indent

const SerialPort = require("serialport"); //constructor for serial port objects
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects

//polls the serial ports in search for an specific serial device every 3sec
var selectedPorts;
var serialComPorts={};

/***********************************
 Manages Serial Devices
 Connection and Disconnections
 **********************************/
function serialDevicesHandler(options, initialize) {
    SerialPort.list(function (err, ports) {
        selectedPorts = ports.filter(function (port) {
            for(var key in options){
                if(port[key]!==options[key])
                    return false
            }
            return true; //return port infos if true (boolean for filter method)
        });

        selectedPorts.forEach(function (port) {
            if (!serialComPorts[port.comName]) {
                //create new serial Queue manager if a new serial device was connected
                serialComPorts[port.comName] = new SerialQueueManager(port.comName, {
                        baudRate: 38400,
                        parser: SerialPort.parsers.readline('\n')
                    },
                    {
                        init: initialize.init //remove it from here to make the code more generic in the future
                    });

                serialComPorts[port.comName].port.on('idchange', err => {
                    if (err) return console.log('ERR on idchange event:' + err.message);
                    console.log('device id changed, deleting serial queue manager' + port.comName);
                    delete serialComPorts[port.comName];
                });
                //add event listener for change in id and destroy the object accordingly then create a new one with the correct por call
            }
        });
    });
    return serialComPorts;
}

//function exports
exports.serialDevicesHandler = serialDevicesHandler;
