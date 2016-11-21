/**
 * Created by qcabrol on 11/21/16.
 */
'use strict';

const DeviceFactory = require("./DeviceFactory");
const OpenBio = require("./devices/OpenBio/OpenBio");
var deviceArr=[];
var deviceList={};

DeviceFactory.on('newDevice',(device)=> {
    console.log('new devcie connected');
    deviceList[device.id]=device;
    DeviceFactory.on('connect',(id)=>{
        updateArray(id,true);
        console.log('device connected with id :' + id);});
    DeviceFactory.on('disconnect',(id)=>{
        updateArray(id,false);
        console.log('device disconnected with id :' + id);});
    updateArray(device.id,true);
});

function updateArray(id,stat){
    var count=0;
    console.log('update array event on id :' + id);
    for(let key in deviceList){
        var deviceType= OpenBio.getDeviceType();
        if(deviceType==='bioreactor'){
            console.log('loop key is :' + key);
            deviceArr[count]=deviceList[key];
            if(stat===true && key==id) deviceArr[count].statusColor='PaleGreen';
            else if(key==id) deviceArr[count].statusColor='Tomato';
            count ++;
        }
    }
    /*
    API.createData('deviceArray',deviceArr);
    API.cache('deviceList',deviceList);*/
}

module.exports = deviceArr; //-> unused, only one global db is more suited
