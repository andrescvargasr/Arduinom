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
//function getList() {
setInterval(function(){  // !!!!!!!!!!! SETINTERVAL TO BE REMOVED LATER, JUST FOR TEST PURPOSES
    SerialPort.list(function (err, ports) {
        //select the ports connected to arduinos
        arduinoPorts = ports.filter(function (port) {
            return port.manufacturer === 'Arduino_LLC'; //return port infos if true (boolean for filter method)
        });

        arduinoPorts.forEach(function (port) {
            if (!serialComPorts[port.comName]) {

                //create new serial Queue manager if a new arduino was connected
                serialComPorts[port.comName] = new SerialQueueManager(port.comName, {
                    baudRate: 38400,
                    parser: SerialPort.parsers.readline('\n')
                });

                //delete SerialQueueManager object when device is disconnected
                serialComPorts[port.comName].on('close', function () {
                    delete serialComPorts[port.comName];
                });
            }
        });
    });
}, 3000);

