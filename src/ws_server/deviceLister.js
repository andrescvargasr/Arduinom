/**
 * Created by qcabrol on 11/21/16.
 */
'use strict';
const EventEmitter = require('events');
const DeviceFactory = require("./../devices/DeviceFactory");
//exported on emitted events listened by the ws server
var deviceList = {};
var deviceArr = [];
var emitter = new EventEmitter();

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
    var count = 0;
    //var bioCount = 0;
    //var spectroCount = 0;
    console.log('update array event on id :' + id);
    for (let key in deviceList) {
        //var deviceType = AbstractDev.getDeviceType();
        console.log('loop key is :' + key);
        deviceArr[count] = deviceList[key];
        deviceArr[count] = deviceList[key];
        if (stat === true && key == id) deviceArr[count].statusColor = 'PaleGreen';
        else if (key == id) deviceArr[count].statusColor = 'Tomato';
        count++;
    }
    emitter.emit('update', deviceArr);
}

module.exports = emitter; //-> unused, only one global db is more suited
