'use strict';

const EventEmitter = require('events');

const defaultOptions = {
    start: 0,
    errorTimeout: 0
};

class IncPoll extends EventEmitter {
    constructor(options) {
        super();
        options = Object.assign({}, defaultOptions, options);
        this.startInc = options.start || 0;
        this.inc = this.startInc;
        this.task = options.task;
        this.chunk = options.chunk;
        this.pollTimeout = options.pollTimeout;
        if (!this.chunk || this.pollTimeout == null || !this.task) {
            throw new Error('IncPoll bad arguments');
        }
    }

    start() {
        if (this.started) return;
        this.started = true;
        this.cont();
    }

    async cont() {
        try {
            var data = await this.task(this.inc);
        } catch (e) {
            if (this.errorTimeout > 0) {
                retry(this, this.errorTimeout);
            }
            return;
        }

        if (Array.isArray(data)) {
            var inc = data.length;
            if (inc) {
                this.emit('data', data);
            }
        } else if (typeof data === 'number') {
            inc = data;
        }

        this.inc += inc;
        if (inc) {
            this.emit('progress', {
                inc: this.inc,
                done: this.inc - this.startInc
            });
        }

        if (this.started) {
            if (inc >= this.chunk) { // continue because hit response's maximum length
                await this.cont();
            } else { // Stop because below response's maximum length, retry later
                retry(this, this.pollTimeout);
            }
        }
    }

    stop() {
        this.started = false;
        clearTimeout(this.timeoutId);
    }
}

function retry(ctx, timeout) {
    ctx.timeoutId = setTimeout(() => ctx.cont(), timeout);
}

module.exports = IncPoll;
