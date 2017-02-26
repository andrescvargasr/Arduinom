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
    console.log(deviceId);
    const start = await connection.getLastSeqId(deviceId);
    console.log('start', start);
    const incPoll = new IncPoll({
        task: async function (inc) {
            console.log(`poll, inc: ${inc}`);
            // Get last entries from device
            const parsed = await device.getParsedMultiLog(inc);
            await connection.saveEntries(deviceId, parsed);
            return parsed;
        },
        chunk: 10,
        start,
        interval: 10000
    });

    incPoll.start();
});



// let running = false;
// Sync every 2 minutes
// setInterval(async function () => {
//     if (running) return;
//     running = true;
//     try {
//         const devices = deviceFactory.getDeviceList();
//         const ids = Object.keys(devices);
//         for (let i = 0; i < ids.length; i++) {
//             let device = devices[ids[i]];
//
//             // Ignore devices that don't have multi log
//             if (!device.getParsedMultiLog) continue;
//
//             const seqId = await connection.getLastSeqId(ids[i]);
//             const parsed = await device.getParsedMultiLog(seqId);
//             console.log('parsed result', parsed);
//         }
//         running = false;
//     } catch (e) {
//         debug(`error syncing : ${e.message}`);
//         running = false;
//     }
//
// }, 120000);
