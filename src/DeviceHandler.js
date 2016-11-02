/**
 * Created by qcabrol on 10/25/16.
 */
"use strict"
//imported
const SerialPort = require("serialport");
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects
const EventEmitter = require("events");
const debug = require("debug")('main:device handler');


class DeviceHandler extends EventEmitter { //issue with extends EventEmitter
    constructor(interval) {
        super();
        this.devices = [];
        this.serialQManagers = {};
        setInterval(this._serialDevices({manufacturer: 'Arduino_LLC'}, { //--> to be removed
                init: 'q',
                endString: '\r\n\r\n'
            }),
            interval); //optionnal : implement a clear method for the setinterval
    }

    /****************************************************
     *   Internal management of the SerialQ Lookup
     ****************************************************/
    _serialDevices(options, initialize) {
        var that = this;
        //find all serial devices connected
        SerialPort.list(function (err, ports) {
            if (err) {
                debug('Port List failed : ' + err);
                return;
            }
            that.selectedPorts = ports.filter(function (port) {
                for (var key in options) {
                    if (port[key] !== options[key])
                        return false
                }
                return true; //return port infos if true (boolean for filter method)
            });

            that.selectedPorts.forEach(function (port) {
                debug('device with desired specs on port :', port.comName);
                if (!that.serialQManagers[port.comName]) {
                    //create new serial Queue manager if a new serial device was connected
                    that.serialQManagers[port.comName] = new SerialQueueManager(port.comName, {
                            baudRate: 38400,
                            parser: SerialPort.parsers.raw
                        },
                        {
                            init: initialize.init,
                            endString: initialize.endString
                        });
                    debug('instantiated new SerialQ');

                    //on ready event
                    that.serialQManagers[port.comName].on('ready', (id) => {
                        debug('serialQManager ready event, instantiating Device entry');
                        if (!that.devices[id]) that.emit('new', id);
                        that.devices[id] = that.serialQManagers[port.comName];
                        that.emit('connect', id);
                    });

                    //on reinit event
                    that.serialQManagers[port.comName].on('reinitialized', (id) => {
                        debug('rematching port and device id on reinitialisation:' + id);
                        if (!that.devices[id])that.emit('new', id);
                        that.devices[id] = that.serialQManagers[port.comName];
                        that.emit('connect', id);
                    });

                    //on idchange event
                    that.serialQManagers[port.comName].on('close', (id) => {
                        debug('device disconnected on port' + port.comName);
                        if (id) that.devices[id] = {};
                        that.emit('disconnect', id);
                    });
                }
            });
        });
    }

    /**************************************************
     *         Functions To be Called Outside
     **************************************************/
    //return promise of q serialQ object with given ID
    getSerialQ(id) {
        var that = this;
        debug('getting serialQ for device', id);
        if (that.devices[id]) return that.devices[id];
        else throw new Error('no existing device with ID: ' + id);
    }
}

module.exports = new DeviceHandler(); //-> unused, only one global db is more suited


