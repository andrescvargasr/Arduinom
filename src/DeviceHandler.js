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
    constructor() {
        super();
        this.devices = [];
        this.serialQManagers = {};
    }

    /****************************************************
     *   Internal management of the SerialQ Lookup
     ****************************************************/
    serialDevices(options, initialize) {
        var that = this;
        //find all serial devices connected
        return new Promise(function (resolve, reject) {
            SerialPort.list(function (err, ports) {
                if (err) return reject(err);
                var arr = [];
                this.selectedPorts = ports.filter(function (port) {
                    for (var key in options) {
                        if (port[key] !== options[key])
                            return false
                    }
                    return true; //return port infos if true (boolean for filter method)
                });

                this.selectedPorts.forEach(function (port) {
                    debug('device with desired specs on port :', port.comName);
                    if (!this.serialQManagers[port.comName]) {
                        //create new serial Queue manager if a new serial device was connected
                        this.serialQManagers[port.comName] = new SerialQueueManager(port.comName, {
                                baudRate: 38400,
                                parser: SerialPort.parsers.raw
                            },
                            {
                                init: initialize.init,
                                endString: initialize.endString
                            });
                        debug('instantiate new SerialQ');

                        //on ready event
                        this.serialQManagers[port.comName].on('ready', (id) => {
                            debug('serialQManager ready event, instantiating Device entry');
                            that.devices[id] = that.serialQManagers[port.comName];
                            if(!that.devices[id])that.emit('new ', id);
                            that.emit('connect', id);
                        });

                        //on reinit event
                        this.serialQManagers[port.comName].on('reinitialized', (id) => {
                            debug('rematching port and device id on reinitialisation:' + id);
                            that.devices[id] = that.serialQManagers[port.comName];
                            if(!that.devices[id])that.emit('new', id);
                            that.emit('connect', id);
                        });

                        //on idchange event
                        this.serialQManagers[port.comName].on('disconnect', (id) => {
                            debug('device disconnected on port' + port.comName);
                            if (id) that.devices[id] = {};
                            that.emit('disconnect', id);
                        });
                    }
                });
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
        return this.ready.then(()=> {
            if (that.devices[id]) return that.devices[id];
            else throw new Error('no existing device with ID: ' + id);
        })
    }
}

exports.Handler = new DeviceHandler(); //-> unused, only one global db is more suited


