'use strict';

const fs = require('fs');
const path = require('path');
const OpenBio = require('../devices/OpenBio/OpenBio');
const OpenSpectro = require('../devices/OpenSpectro/OpenSpectro');
const Solar = require('../devices/Solar/Solar');

const getMethodNames = require('./getMethodNames');

console.log('Generate device API json');
['OpenBio', 'OpenSpectro', 'Solar'].forEach(type => {
    const Device = require(`../devices/${type}/${type}`);
    fs.writeFileSync(path.join(__dirname, `../client/devices/${type}Methods.json`), JSON.stringify(getMethodNames(Device), null, '\t'));
});
process.exit(0);
