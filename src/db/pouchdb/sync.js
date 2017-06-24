'use strict';

// Sync all connected devices with database

const deviceFactory = require('../../devices/DeviceFactory');
const DB = require('./Pouch');
const debug = require('debug')('db:sync');
const IncPoll = require('../../utilities/IncPoll');
const MAX_UINT32 = Math.pow(2,32) - 1;

deviceFactory.on('newDevice', async function (device) {
    // Get start
    // ignore devices that don't have multilog
    if (!device.getParsedMultiLog) return;

    let db = new DB(device.id);
    const start = await db.getLastSequenceId();

    const incPoll = new IncPoll({
        task: async function (inc) {
            debug(`get multiLog and save to db (inc: ${inc})`);
            // Get last entries from device
            const parsed = await device.getParsedMultiLog(inc);

            // Make sure we don't save entries with abnormal id
            const toSave = parsed.filter(p => parsed.id !== MAX_UINT32);
            await db.saveEntries(toSave);
            return parsed;
        },
        chunk: 10,
        start,
        pollTimeout: 20000,
        errorTimeout: 1000
    });

    debug(`start multilog polling (inc: ${start})`);
    incPoll.start();
});

