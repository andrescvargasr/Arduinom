'use strict';
var deviceLister = require('./deviceLister')

//need to handle message formatting for ws client to server communication
// kind: ,value:, etc
function messageWrapper(event, data){
   switch(event){
       default:
           break;
   }

}

function messageParser(event,data){

}



function setListeners(ws) {
    deviceLister.on('update', (array)=> {
        console.log(array);
        ws.send(JSON.stringify(array));
    });
}
function clearListeners() {
    deviceLister.removeAllListeners('update');
}