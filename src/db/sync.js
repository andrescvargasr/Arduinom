'use strict';

// Sync all connected devices with database

const deviceFactory = require('../devices/DeviceFactory');
const connection = require('./connection');
const debug = require('debug')('db:sync');
const IncPoll = require('../utilities/IncPoll');

deviceFactory.on('newDevice', async function (device) {
    // Get start
    // ignore devices that don't have multilog
    if (!device.getParsedMultiLog) return;
    let deviceId = 'device' + device.id;
    const start = await connection.getLastSeqId(deviceId);
    const incPoll = new IncPoll({
        task: async function (inc) {
            debug(`get multiLog and save to db (inc: ${inc})`);
            // Get last entries from device
            const parsed = await device.getParsedMultiLog(inc);
            await connection.saveEntries(deviceId, parsed);
            return parsed;
        },
        chunk: 10,
        start,
        interval: 10000
    });

    debug(`start multilog polling (inc: ${start})`);
    incPoll.start();
});

