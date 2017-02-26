'use strict';

const EventEmitter = require('events');

class IncPoll extends EventEmitter {
    constructor(options) {
        super();
        this.startInc = options.start || 0;
        this.inc = this.startInc;
        this.task = options.task;
        this.chunk = options.chunk;
        this.interval = options.interval;
        if(!this.chunk || this.interval == null) throw new Error('IncPoll bad arguments');
    }

    start() {
        if(this.started) return;
        this.started = true;
        this.cont();
    }

    async cont() {
        let data = await this.task(this.inc);
        if(Array.isArray(data)) {
            var inc = data.length;
            if(inc) {
                this.emit('data', data);
            }
        } else if(typeof data === 'number') {
            inc = data;
        }

        this.inc += inc;
        if(inc) {
            this.emit('progress', {
                inc: this.inc,
                done: this.inc - this.startInc
            });
        }

        if(this.started) {
            if(inc >= this.chunk) { // continue because hit response's maximum length
                await this.cont();
            } else { // Stop because below response's maximum length, retry later
                this.timeoutId = setTimeout(() => this.cont(), this.interval);
            }
        }

    }

    stop() {
        this.started = false;
        clearInterval(this.timeoutId);
    }
}

module.exports = IncPoll;