"use strict"
const EventEmitter = require("events");
const SerialPort = require("serialport");
const debug= require("debug")('main:serialqmanager');

class SerialQueueManager extends EventEmitter { //issue with extends EventEmitter
    constructor(port, options, initialize) {
        super(); // 'this' not defined if constructor super class not called);
        this.portOptions = options;
        this.portParam = port;
        this.initCommand=(initialize.init || 'q');
        this.endString=(initialize.endString || '\n\n');
        this.queueLength = 0;
        this.maxQLength=(initialize.maxQLength || 30);
        this.buffer = "";
        this.lastRequest = Promise.resolve('');      // The Last received request
        this.currentRequest = Promise.resolve(''); // The current request being executed
        this.serialResponseTimeout = (initialize.serialResponseTimeout || 200);//config.serialResponseTimeout || 125;
        this.ready = false; // True if ready to accept new requests into the queue
        this.status = 'Serial port not initialized';
        this._reconnectionAttempt(port, options);
    }

    /*****************************************************
     Queue Management Functions
     *****************************************************/



    serialPortInit() {
        var that = this;
        that.status = 'Serial port initializing';
        this.addRequest(that.initCommand, {timeout: 200})
            .then(function (buffer) {
                debug('init command buffer ready ', buffer);
                //manage a change in device Id
                //listener should be defined on other js file to destroy the object in this case
                if (!buffer) {
                    throw new Error('Empty buffer when reading qualifier');
                }  else if (!buffer.match(/^\d{1,5}\r\n\r\n$/)){
                    throw new Error('invalid qualifier');
                } else if (that.deviceId &&(that.deviceId !== parseInt(buffer))) {
                    that.emit('idchange');
                    throw new Error('Device Id changed to:' + buffer);
                } else if (!that.deviceId){
                    that.deviceId = parseInt(buffer);
                    that.status = 'Serial port initialized';
                    that.ready = true;
                    that.emit('ready');
                    debug('Serial port initialized:' + parseInt(buffer));
                } else {
                    that.deviceId = parseInt(buffer);
                    that.status = 'Serial port initialized';
                    that.ready = true;
                    that.emit('reinitialized');
                    debug('Serial port re-initialized:' + parseInt(buffer));
                }

            })
            .catch(function (err) {
                //debug('serial init failed');
                debug(err);
                that._scheduleInit();

            });
    }

    //here we clear the timeout if already existing, avoid multiple instances of serialportinit running in parallel
    _scheduleInit(){
        if(this.initTimeout){
            clearTimeout(this.initTimeout) //core of the solution
        }
        this.initTimeout= setTimeout(()=> {
            this.serialPortInit()
        }, 2000);
    }

    addRequest(cmd, options) {
        var that = this;
        options = options || {};
        if (!that.ready && (cmd!== that.initCommand)) return Promise.reject(new Error('Device is not ready yet', that.status)); //new error is better practice
        if (that.queueLength>that.maxQLength) {
            debug('max Queue length reached for device :', that.deviceId);
            return Promise.reject(new Error('Maximum Queue size exceeded, wait for commands to be processed'));
        }
        that.queueLength++;
        debug('adding request to serialQ for device :', that.deviceId);
        debug('number of requests in Queue :', that.queueLength);
        //add one request to the queue at the beginning or the end
        that.lastRequest = that.lastRequest.then(that._appendRequest(cmd, options.timeout), that._appendRequest(cmd, options.timeout));
        return that.lastRequest;
    }

    /************************************************
     Main Utility function, adds a Request
     To the Serial Queue and return a Promise
     ************************************************/
    _appendRequest(cmd, timeout) {
        var that = this;
        timeout = timeout || this.serialResponseTimeout;
        return function () {
            that.currentRequest = new Promise(function (resolve, reject) {
                //attach solvers to the currentRequest object
                that.resolveRequest = resolve;
                that.rejectRequest = reject;
                var bufferSize = 0;
                doTimeout(true);
                debug('Sending command:' + cmd)
                that.port.write(cmd + '\n', function (err) {
                    if (err) {
                        that._handleError(err);
                        // Just go to the next request
                        debug('write error occurred: ', err);
                        return reject(new Error('Error writing to serial port'));
                    }

                });

                function doTimeout(force) {
                    //keeps calling itself recursively as long as the request was not served
                    if (bufferSize < that.buffer.length || force) {
                        //if (force) debug('timeout forced');
                        //else debug('timeout renewed');
                        bufferSize = that.buffer.length;
                        that.timeout = setTimeout(function () {
                            doTimeout();
                        }, timeout);
                        return;
                    }
                    //debug('command served:' + that.buffer);
                    if(!that.buffer.endsWith(that.endString)) reject(new Error('buffer not ending properly'));
                    that._resolve(that.buffer);
                    that.buffer = ""; //empty the buffer
                }
            });
            return that.currentRequest;
        }
    }

    //reduce the queue once one request was solved, then set the promise as solved
    _resolve() {
        this.queueLength--; //where ctx is the context (that of the constructor)
        this.resolveRequest(arguments[0]);
    }

    //error handler
    _handleError(err) {
        if (!this.ready) return; // Already handling an error
        this.ready = false;
        this.port.close(()=> {
            debug('Connection to serial port failed, closing connection and retrying in 2 seconds' + err);
            if (err) debug('serial port could not be closed');
            else debug('serial port was closed');
        });
    }

    /************************************************
     Utilities, outside the constructor
     Should not be called outside of here
     They handle disconnect/reconnect events
     ************************************************/
    //reconnection handler
    _reconnectionAttempt() {
        debug('reconnection attempt: ' + this.portParam);
        this._hasPort().then(()=> {
            this.port = new SerialPort(this.portParam, this.portOptions);
            /***************************************************************
             propagate SerialPort events + handle messages (listeners)
             ****************************************************************/
            //handle the SerialPort open events
            this.port.on('open',() => {
                debug('opened port:', this.portParam);
                this.emit('open');
                this.status = 'Serial port not initialized';
                this._scheduleInit();
            });

            //handle the SerialPort error events
            this.port.on('error', err => {
                this.status = 'Serial port Error';
                this.ready = false;
                debugger;
                if (err) return debug('ERR event1:' + err);
                debug('ERR event2: ', this.portParam);
                this.emit('error', err);
            });

            //handle the SerialPort disconnect events
            this.port.on('disconnect', err => {
                this.status = 'Serial port disconnected';
                this.ready = false;
                if (err) return debug('ERR on disconnect:' + err.message);
                debug('port disconnect:', this.portParam);
                this.emit('disconnect', err);
            });

            //handle the SerialPort close events and destruct the SerialQueue manager
            this.port.on('close', err => {
                this.status = 'Serial port closed';
                if (err) return this.debug('ERR on closing:' + err.message);
                debug('closed port:', this.portParam);
                delete this.port;
                this.emit('close', err);
                this._reconnectionAttempt();
            });

            //handle the SerialPort data events
            this.port.on('data', (data) => {
                this.buffer += data.toString();     //that or this ???? not clear when using one or the other
                //debug(this.buffer);
                //debug('Data event');
                this.emit('data', data);
            });
        }, (err)=> {
            this.status = 'Unable to find the port.';
            this._tryLater();
        });


    }

    //see if the port that was used is actually connected
    _hasPort() {
        debug('called _hasPort');
        var that = this;
        return new Promise(function (resolve, reject) {
            SerialPort.list(function (err, ports) {
                if (err) return reject(err);
                var port = ports.find((port)=> {
                    return port.comName === that.portParam;
                });
                debug('found Port');
                if (port) return resolve();
                reject(new Error(`Port ${that.portParm} not found`));
            });
        });
    }

    //wait loop
    _tryLater() {
        this.ready = false;
        if (!this.isWarned) debug('Unable to connect to port ', this.portParam, '. Please check if your device is connected or your device configuration. We will retry connecting every 2 seconds');
        this.isWarned = true;
        setTimeout( ()=> {
            this._reconnectionAttempt();
        }, 2000);
    }

}

module.exports = SerialQueueManager;
