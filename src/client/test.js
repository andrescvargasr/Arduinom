'use strict';

const getMethodNames = require('./getMethodNames');
const OpenBio = require('../devices/OpenBio/OpenBio');

console.log(getMethodNames(OpenBio));