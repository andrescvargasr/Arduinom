"use strict"
//usermod -a -G dialout quentin + newgrp dialout ---> for serial port access rights
//exports = fonction / objet / class etc... --> permet de faire un require du fichier
//ctrl alt + l  for auto indent

const SerialPort = require("serialport"); //constructor for serial port objects
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects

//polls the serial ports in search for an arduino every 10sec
var arduinoPorts;
var serialComPorts = {};

//To be done:
//handle serial port error event, disconnect event and data event in SerialQueue manager
// separate in two functions and create instanciation of SerialQueue objects only when a request is performed from the visualizer after a call of getList
function getList(options) {
    SerialPort.list(function (err, ports) {
        arduinoPorts = ports.filter(function (port) {
            return port.manufacturer === options.manufacturer; //return port infos if true (boolean for filter method) see if it actually works on other platforms
        });

        arduinoPorts.forEach(function (port) {
            if (!serialComPorts[port.comName]) {
                //create new serial Queue manager if a new arduino was connected
                serialComPorts[port.comName] = new SerialQueueManager(port.comName, {
                    baudRate: 38400,
                    parser: SerialPort.parsers.readline('\n')
                },
                {
                    init:'q'
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
}

//function exports
exports.getList=getList;
