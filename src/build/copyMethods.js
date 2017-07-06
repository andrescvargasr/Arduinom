'use strict';

const fs = require('fs');
const path = require('path');
const OpenBio = require('../devices/OpenBio/OpenBio');
const OpenSpectro = require('../devices/OpenSpectro/OpenSpectro');

const getMethodNames = require('./getMethodNames');
fs.writeFileSync(path.join(__dirname, '../client/openBioMethods.json'), JSON.stringify(getMethodNames(OpenBio)));
fs.writeFileSync(path.join(__dirname, '../client/openSpectroMethods.json'), JSON.stringify(getMethodNames(OpenSpectro)));
process.exit(0);
