'use strict';

const getMethodNames = require('../build/getMethodNames');
const OpenBio = require('../devices/OpenBio/OpenBio');

console.log(getMethodNames(OpenBio));
process.exit();