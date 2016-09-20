"use strict"
const EventEmitter = require("events");
const SerialPort = require("serialport"); //constructor for serial port objects

class SerialQueueManager extends EventEmitter { //issue with extends EventEmitter
    constructor(port, options) {
        super(); // 'this' not defined if constructor super class not called
        this.port = new SerialPort(port, options);
        this.deviceId = 0x0000;
        this.queueLength = 0;
        this.buffer = "";
        this.lastRequest = Promise.resolve('');      // The Last received request
        this.currentRequest = Promise.resolve(''); // The current request being executed
        this.serialResponseTimeout = 200;//config.serialResponseTimeout || 125;
        this.ready = false; // True if ready to accept new requests into the queue
        this.status = 'Serial port not initialized';

        /***************************************************************
         propagate SerialPort events + handle messages (listeners)
         ****************************************************************/
        //handle the SerialPort open events
        this.port.on('open', err => {
            this.status = 'Serial port not initialized';
            this.ready = false; //opening does not mean ready (need to get the qualifier first)
            if (err) return console.log('ERR on opening port:' + err.message);
            console.log('opened port:', port);
            this.emit('open', err);
            serialPortInit();
        });

        //handle the SerialPort error events
        this.port.on('error', err => {
            if (err) return console.log('ERR event:' + err.message);
            console.log('ERR event: ', port);
            this.emit('error', err);
        });

        //handle the SerialPort disconnect events
        this.port.on('disconnect', err => {
            this.status = 'Serial port disconnected';
            this.ready = false;
            if (err) return console.log('ERR on disconnect:' + err.message);
            console.log('port disconnect:', port);
            this.emit('disconnect', err);
        });

        //handle the SerialPort close events and destruct the SerialQueue manager
        this.port.on('close', err => {
            this.status = 'Serial port closed';
            if (err) return this.console.log('ERR on closing:' + err.message);
            console.log('closed port:', port);
            this.emit('close', err);
        });

        //handle the SerialPort data events
        this.port.on('data', (data, err) => {
            if (err) return console.log('ERR on data event:' + err.message);
            else     this.buffer += data.toString();     //that or this ???? not clear when using one or the other
            console.log('Data event: ' + data);
            this.emit('data', data, err);
        });

        /*****************************************************
         Queue Management Functions
         *****************************************************/

        var that = this;

        function serialPortInit() {
            addRequest('q')
                .then(function (buffer) {
                    that.deviceId = buffer;
                    if(!buffer){
                        throw new Error('Empty buffer when reading qualifier');
                    }
                    that.status = 'Serial port initialised';
                    that.ready = true;
                    that.emit('ready');
                    console.log('Serial port reinitialized:'+ buffer);
                })
                .catch(function (err) {
                    //console.log('serial init failed');
                    console.log(err);
                    setTimeout(function(){
                        serialPortInit()
                    }, 2000);

                });
        }

        function addRequest(cmd, options) {
            options = options || {};
            if (!that.ready && cmd != 'q') return Promise.reject(that.status);
            that.queueLength++;
            //add one request to the queue at the beginning or the end
            that.lastRequest = that.lastRequest.then(that._appendRequest(cmd, options.timeout), that._appendRequest(cmd, options.timeout));
            return that.lastRequest;
        }


// events to be emitted
//       this.emit('ready',  ); //when qualifier was received, emitted event on fulfilled promise
    }

    //add request to the end of the queue
    _appendRequest(cmd, timeout) {
        var that =this;
        timeout = timeout || this.serialResponseTimeout;
        return function () {
            that.currentRequest = new Promise(function(resolve, reject){
                //attach solvers to the currentRequest object
                that.resolveRequest = resolve;
                that.rejectRequest = reject;
                //console.log('appendRequest');
                var bufferSize = 0;
                doTimeout(true);
                console.log('Sending command:' + cmd)
                that.port.write(cmd + '\n', function(err) {
                    if (err) {
                        that._handleError(err);
                        // Just go to the next request
                        console.log('write error occurred, serial connection may be interrupted', err);
                        return reject(new Error('Error writing to serial port'));
                    }
                });


                function doTimeout(force) {
                    //keeps calling itself recursively as long as the request was not served
                    if (bufferSize < that.buffer.length || force) {
                        if (force) console.log('timeout forced');
                        else console.log('timeout renewed');
                        bufferSize = that.buffer.length;
                        that.timeout = setTimeout(function() {
                            doTimeout();
                        }, timeout);
                        return;
                    }
                    console.log('command served:'+ that.buffer);
                    that._resolve(that.buffer);
                    that.buffer = ""; //empty the buffer
                }
            });
            return that.currentRequest;
        }
    }

    //reduce the queue once one request was solved, then set the promise as solved
    _resolve() {
        var that=this;
        that.queueLength--; //where ctx is the context (that of the constructor)
        that.resolveRequest(arguments[0]);
    }

    _handleError(err) {
        if (!this.ready) return; // Already handling an error
        this.ready = false;
        this.port.close(()=> {
            console.log('Connection to serial port failed, closing connection and retrying in 2 seconds' + err);
            if (err) console.log('serial port could not be closed');
            else console.log('serial port was closed');
//            setTimeout(()=> {
//                this.serialPortInit();
//            }, 2000);
        });
    }
}

module.exports = SerialQueueManager;

