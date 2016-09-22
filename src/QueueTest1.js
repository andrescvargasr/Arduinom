/**
 * Created by qcabrol on 9/22/16.
 */
const SerialDevices= require("./SerialDevices");
const SerialQueueManager= require("./SerialQueueManager");

var requestRepeat=10;


setInterval(()=>{
    SerialDevices.getList({manufacturer: 'Arduino_LLC'});
},3000);

//listen to data event and send then to pouchdb