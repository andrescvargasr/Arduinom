'use strict';
import EventEmitter from 'events';

class IncPoll extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.inc = this.options.start || 0;
        this.busy = false;
        this.task = this.options.task;
    }

    start() {
        if(this.started) return;
        this.started = true;
        this.cont();
    }

    async cont() {
        console.log('poll');
        this.busy = true;
        let data = await this.task(this.inc, this.options.chunk);
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
                done: this.inc - this.options.start
            });
        }

        if(this.options.chunk <= inc) {
            await this.cont();
        } else {
            this.busy = false;
            this.timeoutId = setTimeout(() => this.cont(), this.options.interval);
        }
    }

    stop() {
        clearInterval(this.timeoutId);
    }
}

export default IncPoll;