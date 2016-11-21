/**
 * Created by qcabrol on 11/21/16.
 */
'use strict';
const EventEmitter = require('events');
const DeviceFactory = require("./../DeviceFactory");
const AbstractDev = require('../devices/AbstractDevice');
//exported on emitted events listened by the ws server
var deviceList = {};
var deviceArr = [];
var spectroArr = [];
var bioArr = [];


DeviceFactory.on('newDevice', (device)=> {
    console.log('new devcie connected');
    deviceList[device.id] = device;
    DeviceFactory.on('connect', (id)=> {
        updateArray(id, true);
        console.log('device connected with id :' + id);
    });
    DeviceFactory.on('disconnect', (id)=> {
        updateArray(id, false);
        console.log('device disconnected with id :' + id);
    });
    updateArray(device.id, true);
});

function updateArray(id, stat) {
    var emitter = new EventEmitter();
    var count = 0;
    var bioCount = 0;
    var spectroCount = 0;
    console.log('update array event on id :' + id);
    for (let key in deviceList) {
        var deviceType = AbstractDev.getDeviceType();
        console.log('loop key is :' + key);
        deviceArr[count] = deviceList[key];
        deviceArr[count] = deviceList[key];
        if (stat === true && key == id) deviceArr[count].statusColor = 'PaleGreen';
        else if (key == id) deviceArr[count].statusColor = 'Tomato';
        count++;
        /* see if here or on client side
         switch (deviceType) {
         case 'bioreactor':
         bioArr[bioCount] = deviceList[key];
         bioArr[bioCount] = deviceList[key];
         bioCount++;
         break;
         case 'openspectro':
         spectroArr[spectroCount] = deviceList[key];
         spectroArr[spectroCount] = deviceList[key];
         spectroCount++;
         break;
         default:
         console.log('unknown device connected: ' + deviceType);
         break;
         }
         */
    }
    emitter.emit('devices', deviceArr);
}

module.exports = deviceArr; //-> unused, only one global db is more suited
