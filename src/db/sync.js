'use strict';
const deviceFactory = require('../devices/DeviceFactory');
const connection = require('./connection');
const debug = require('debug')('db:sync');

let running = false;
// Sync connected devices with database
// Sync every 2 minutes
setInterval(async function () => {
    running = true;
    try {
        const devices = deviceFactory.getDeviceList();
        const ids = Object.keys(devices);
        for(let i=0; i<ids.length; i++) {
            let device = devices[ids[i]];

            // Ignore devices that don't have multi log
            if(!device.getParsedMultiLog) continue;

            const seqId = await connection.getLastSeqId(ids[i]);
            const parsed = await device.getParsedMultiLog(seqId);
            console.log('parsed result', parsed);
        }
        running = false;
    } catch(e) {
        debug(`error syncing : ${e.message}`);
        running = false;
    }

}, 120000);
