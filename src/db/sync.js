'use strict';

// Sync all connected devices with database

const deviceFactory = require('../devices/DeviceFactory');
const DB = require('./mongodb/Mongo');
const debug = require('debug')('db:sync');
const IncrementalPoll = require('../utilities/IncrementalPoll');
const MAX_UINT32 = Math.pow(2, 32) - 1;

deviceFactory.on('newDevice', async function (device) {
    // Get start
    // ignore devices that don't have multilog
    if (!device.getParsedMultiLog) return;

    let db = new DB(device.id);
    const start = await db.getLastSequenceId();

    const incrementalPoll = new IncrementalPoll({
        task: async function (inc) {
            debug(`get multiLog and save to db (inc: ${inc})`);
            // Get last entries from device
            const parsed = await device.getParsedMultiLog(inc);
            // Make sure we don't save entries with abnormal id
            const toSave = parsed.filter(() => parsed.id !== MAX_UINT32);
            await db.saveEntries(toSave);
            // we get the highest id save
            return {
                increment: parsed.length,
                next: Math.max(...toSave.map(a => a.id)) + 1
            };
        },
        chunk: 10,
        start: start + 1,
        pollTimeout: 20000,
        errorTimeout: 3000
    });

    debug(`start multilog polling (inc: ${start})`);
    incrementalPoll.start();
});

