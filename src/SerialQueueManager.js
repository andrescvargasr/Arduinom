"use strict"
const EventEmitter = require("events");
const SerialPort = require("serialport"); //constructor for serial port objects

class SerialQueueManager extends EventEmitter { //issue with extends EventEmitter
    constructor(port, options, initialize) {
        super(); // 'this' not defined if constructor super class not called);
        this.portOptions = options;
        this.portParam = port;
        this.initCommand=(initialize.init || 'q');
        this.queueLength = 0;
        this.buffer = "";
        this.lastRequest = Promise.resolve('');      // The Last received request
        this.currentRequest = Promise.resolve(''); // The current request being executed
        this.serialResponseTimeout = 200;//config.serialResponseTimeout || 125;
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
                //manage a change in device Id
                //listener should be defined on other js file to destroy the object in this case
                if (!buffer) {
                    throw new Error('Empty buffer when reading qualifier');
                }  else if (!buffer.match(/^\d{1,5}\s*$/)){
                    throw new Error('invalid qualifier');
                } else if (that.deviceId &&(that.deviceId !== buffer)) {
                    that.emit('idchange');
                    throw new Error('Device Id changed to:' + buffer);
                } else {
                    that.deviceId = buffer;
                    that.status = 'Serial port initialized';
                    that.ready = true;
                    that.emit('ready');
                    console.log('Serial port initialized:' + buffer);
                }
            })
            .catch(function (err) {
                //console.log('serial init failed');
                console.log(err);
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
        if (!that.ready && (cmd!== that.initCommand)) return Promise.reject(that.status);
        that.queueLength++;
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
                //console.log('appendRequest');
                var bufferSize = 0;
                doTimeout(true);
                console.log('Sending command:' + cmd)
                that.port.write(cmd + '\n', function (err) {
                    if (err) {
                        that._handleError(err);
                        // Just go to the next request
                        console.log('write error occurred: ', err);
                        return reject(new Error('Error writing to serial port'));
                    }

                });

                function doTimeout(force) {
                    //keeps calling itself recursively as long as the request was not served
                    if (bufferSize < that.buffer.length || force) {
                        if (force) console.log('timeout forced');
                        else console.log('timeout renewed');
                        bufferSize = that.buffer.length;
                        that.timeout = setTimeout(function () {
                            doTimeout();
                        }, timeout);
                        return;
                    }
                    console.log('command served:' + that.buffer);
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
            console.log('Connection to serial port failed, closing connection and retrying in 2 seconds' + err);
            if (err) console.log('serial port could not be closed');
            else console.log('serial port was closed');
        });
    }

    /************************************************
     Utilities, outside the constructor
     Should not be called outside of here
     They handle disconnect/reconnect events
     ************************************************/
    //reconnection handler
    _reconnectionAttempt() {
        console.log('reconnection attempt: ' + this.portParam);
        this._hasPort().then(()=> {
            this.port = new SerialPort(this.portParam, this.portOptions);
            /***************************************************************
             propagate SerialPort events + handle messages (listeners)
             ****************************************************************/
            //handle the SerialPort open events
            this.port.on('open', err => {
                if (err) return console.log('ERR on opening port:' + err.message);
                console.log('opened port:', this.portParam);
                this.emit('open', err);
                this.status = 'Serial port not initialized';
                this._scheduleInit();
            });

            //handle the SerialPort error events
            this.port.on('error', err => {
                this.status = 'Serial port Error';
                this.ready = false;
                if (err) return console.log('ERR event:' + err.message);
                console.log('ERR event: ', this.portParam);
                this.emit('error', err);
            });

            //handle the SerialPort disconnect events
            this.port.on('disconnect', err => {
                this.status = 'Serial port disconnected';
                this.ready = false;
                if (err) return console.log('ERR on disconnect:' + err.message);
                console.log('port disconnect:', this.portParam);
                this.emit('disconnect', err);
            });

            //handle the SerialPort close events and destruct the SerialQueue manager
            this.port.on('close', err => {
                this.status = 'Serial port closed';
                if (err) return this.console.log('ERR on closing:' + err.message);
                console.log('closed port:', this.portParam);
                delete this.port;
                this.emit('close', err);
                this._reconnectionAttempt();
            });

            //handle the SerialPort data events
            this.port.on('data', (data, err) => {
                if (err) return console.log('ERR on data event:' + err.message);
                else     this.buffer += data.toString();     //that or this ???? not clear when using one or the other
                console.log('Data event: ' + data);
                this.emit('data', data, err);
            });
        }, (err)=> {
            this.status = 'Unable to find the port.';
            this._tryLater();
        });


    }

    //see if the port that was used is actually connected
    _hasPort() {
        var that = this;
        return new Promise(function (resolve, reject) {
            SerialPort.list(function (err, ports) {
                if (err) return reject(err);
                var port = ports.find((port)=> {
                    return port.comName === that.portParam;
                });
                if (port) return resolve();
                reject(new Error(`Port ${that.portParm} not found`));
            });
        });
    }

    //wait loop
    _tryLater() {
        this.ready = false;
        if (!this.isWarned) console.log('Unable to connect to port ', this.portParam, '. Please check if your device is connected or your device configuration. We will retry connecting every 2 seconds');
        this.isWarned = true;
        setTimeout( ()=> {
            this._reconnectionAttempt();
        }, 2000);
    }

}

module.exports = SerialQueueManager;
