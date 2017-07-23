'use strict';

const fs = require('fs');
const path = require('path');
const OpenBio = require('../devices/OpenBio/OpenBio');
const OpenSpectro = require('../devices/OpenSpectro/OpenSpectro');

const getMethodNames = require('./getMethodNames');

console.log('Generate device API json');
fs.writeFileSync(path.join(__dirname, '../client/openBioMethods.json'), JSON.stringify(getMethodNames(OpenBio), null, '\t'));
fs.writeFileSync(path.join(__dirname, '../client/openSpectroMethods.json'), JSON.stringify(getMethodNames(OpenSpectro), null, '\t'));
process.exit(0);
