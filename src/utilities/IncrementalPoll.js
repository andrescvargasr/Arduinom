'use strict';

const EventEmitter = require('events');

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
        if (!this.chunk || this.pollTimeout == null || !this.task) {
            throw new Error('IncrementalPoll bad arguments');
        }
    }

    start() {
        if (this.started) return;
        this.started = true;
        this.doStep();
    }

    async doStep() {
        try {
            var result = await this.task(this.nextStep);
        } catch (e) {
            if (this.errorTimeout > 0) {
                retry(this, this.errorTimeout);
            }
            return;
        }

        if (result.next) {
            this.nextStep=result.next;
            this.emit('progress', {
                nextStep: this.nextStep,
                done: this.nextStep - this.startIncrement
            });
        }

        if (this.started) {
            if (result.increment >= this.chunk) { // continue because hit response's maximum length
                await this.doStep();
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
    ctx.timeoutId = setTimeout(() => ctx.doStep(), timeout);
}

module.exports = IncrementalPoll;
