'use strict';

const EventEmitter = require('events');
const debug = require('debug')('arduinom:IncrementalPoll');

const defaultOptions = {
    start: 0,
    errorTimeout: 0
};

class IncrementalPoll extends EventEmitter {
    constructor(options) {
        super();
        options = Object.assign({}, defaultOptions, options);
        this.startIncrement = options.start || 0;
        this.nextStep = this.startIncrement;
        this.task = options.task;
        this.chunk = options.chunk;
        this.pollTimeout = options.pollTimeout;
        this.errorTimeout = options.errorTimeout;
        if (!this.chunk || this.pollTimeout == null || !this.task) {
            throw new Error('IncrementalPoll bad arguments');
        }
    }

    start() {
        debug('start');
        if (this.started) return;
        this.started = true;
        this.doStep();
    }

    async doStep() {
        debug('do step');
        try {
            var result = await this.task(this.nextStep);
        } catch (e) {
            if (this.errorTimeout > 0) {
                debug(`error, schedule again in ${this.errorTimeout} ms`);
                retry(this, this.errorTimeout);
            } else {
                debug('abandon after error');
            }
            return;
        }

        debug('task succeeded');
        if (result.next) {
            this.nextStep = result.next;
            debug(`next step will be: ${this.nextStep}`);
            this.emit('progress', {
                nextStep: this.nextStep,
                done: this.nextStep - this.startIncrement
            });
        }

        if (this.started) {
            if (result.increment >= this.chunk) { // continue because hit response's maximum length
                await this.doStep();
            } else { // Stop because below response's maximum length, retry later
                debug(`schedule next step in ${this.pollTimeout} ms`);
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
    ctx.timeoutId = setTimeout(() => ctx.doStep(), timeout);
}

module.exports = IncrementalPoll;
