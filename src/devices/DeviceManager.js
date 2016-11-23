/**
 * Created by qcabrol on 10/25/16.
 */
'use strict';
const SerialPort = require('serialport');
const SerialQueueManager = require('./../utilities/SerialQueueManager'); //constructor for serial port objects
const EventEmitter = require('events');
const debug = require('debug')('main:device handler');
const haveConnectedIds = [];

class DeviceManager extends EventEmitter { //issue with extends EventEmitter
    constructor(interval) {
        super();
        this.interval = interval;
        this.devices = [];
        this.serialQManagers = {};
        this.restart();
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
    }

    restart() {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(()=>this._serialDevices({manufacturer: 'Arduino_LLC'}, {
            init: 'q',
            endString: '\r\n\r\n'
        }), this.interval);
    }

    // Internal management of the SerialQ Lookup
    _serialDevices(options, initialize) {
        debug('call to _serialDevices method');
        var that = this;
        //find all serial devices connected
        SerialPort.list(function (err, ports) {
            if (err) {
                debug('Port List failed : ' + err);
                return;
            }
            var selectedPorts = ports.filter(function (port) {
                for (var key in options) {
                    if (port[key] !== options[key])                        {
                        return false;
                    }
                }
                return true; //return port infos if true (boolean for filter method)
            });

            selectedPorts.forEach(function (port) {
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
                        debug('serialQManager ready event, instantiating Device entry:' + id);
                        that._deviceConnected(id, port.comName);
                    });

                    //on reinit event
                    that.serialQManagers[port.comName].on('reinitialized', (id) => {
                        debug('rematching port and device id on reinitialisation:' + id);
                        that._deviceConnected(id, port.comName);
                    });

                    //on idchange event
                    that.serialQManagers[port.comName].on('idchange', (id) => {
                        debug('on deviceId change for port' + port.comName);
                        debug('serialQManager idchangevent event, instantiating Device entry:' + id);
                        that._deviceConnected(id, port.comName);
                    });

                    that.serialQManagers[port.comName].on('disconnect', (id) => {
                        debug('device disconnected on port' + port.comName);
                        debug('closed port for device : ' + id);
                        if (id) delete that.devices[id];
                        that.emit('disconnect', id);
                    });
                }
            });
        });
    }

    _deviceConnected(id, comName) {
        var hasPreviouslyConnected = haveConnectedIds.includes(id);
        this.devices[id] = this.serialQManagers[comName];
        if(hasPreviouslyConnected) {
            this.emit('connect', id);
        } else {
            haveConnectedIds.push(id);
            this.emit('new', id);
        }
    }

    /**************************************************
     *         Functions To be Called Outside
     **************************************************/
    //return promise of q serialQ object with given ID
    getSerialQ(id) {
        var that = this;
        debug('getting serialQ for device', id);
        if (that.devices[id]) return that.devices[id];
        else throw new Error(`device with ID ${id} is not connected`);
    }
}

module.exports = new DeviceManager(8000); //-> unused, only one global db is more suited

