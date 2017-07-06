'use strict';

var debug = require('debug')('arduimon:main:utilities');
var util = require('./util');

// TODO: review this file completly!!
module.exports = {
    parseMultiLog,
    parseCompactLog
};

function parseMultiLog(buffer, options = {}) {
    var lines = buffer.split(/[\r\n]+/);
    var entries = [];
    for (var line of lines) {
        var entry = processMultilogLine(line, options);
        if (entry) entries.push(entry);
    }
    // Check that all entries come from the same device!!
    if (entries.length > 0) {
        var deviceId = entries[0].deviceId;
        for (var i = 1; i < entries.length; i++) {
            if (entries[i].deviceId !== deviceId) {
                debug('checkdigit is ok but all lines did not come from the same device. There are at least 2 device ids: ' + entries[0].deviceId + ', ' + entries[i].deviceId);
                throw new Error('all lines do not have the same id');
            }
        }
    }
    return entries;
}


function parseCompactLog(line, numberParameters) {
    var lineLength = numberParameters * 4 + 14;

    // this line contains the 26 parameters as well as the check digit. We should
    // only consider the line if the check digit is ok
    const entry = {};
    if (lineLength && line.length !== lineLength) {
        debug('Unexpected response length: ', line.length, 'instead of ', lineLength);
        throw new Error('Unexpected response length');
    }

    if (checkDigit(line)) {
        entry.epoch = parseInt('0x' + line.substring(0, 8));
        parseParameters(line, 8, numberParameters, entry);
        entry.deviceId = convertSignedIntHexa(line.substring(8 + (numberParameters * 4), 12 + (numberParameters * 4)));
        if (!entry.deviceId) {
            throw new Error('Could not parse device id in process StatusLine');
        }
        entry.deviceCode = util.deviceIdNumberToString(entry.deviceId);
    } else {
        debug('Check digit error', line);
        throw new Error('Check digit error');
    }
    return entry;
}

function processMultilogLine(line, options) {
    const {
        hasEvent = true,
        numberLogParameters = 26
    } = options;
    let lineLength = 8 + 8 + numberLogParameters * 4 + 4 + 2;
    if (hasEvent) lineLength += 8;
    const entry = {};
    if (lineLength && line.length !== lineLength) {
        debug('Unexpected response length: ', line.length, 'instead of ', lineLength);
        throw new Error('Unexpected response length');
    }

    if (checkDigit(line)) {
        entry.id = parseInt('0x' + line.substr(0, 8));
        entry.epoch = parseInt('0x' + line.substr(8, 8));
        parseParameters(line, 16, numberLogParameters, entry);

        let position = 16 + numberLogParameters * 4;
        if (hasEvent) {
            entry.event = convertSignedIntHexa(line.substr(position, 4));
            entry.eventValue = convertSignedIntHexa(line.substr(position + 4, 4));
            position += 8;
        }

        entry.deviceId = convertSignedIntHexa(line.substr(position, 4));
        if (!entry.deviceId) {
            throw new Error('Could not parse device id in processMultilogLine');
        }
        entry.deviceCode = util.deviceIdNumberToString(entry.deviceId);
    } else {
        debug('Check digit error', line);
        throw new Error('Check digit error');
    }
    return entry;
}


// Utility functions
function parseParameters(line, start, numberParameters, entry) {
    for (var i = 0; i < numberParameters; i++) {
        if (i === 0) entry.parameters = {};
        var value = convertSignedIntHexa(line.substring(start + (i * 4), start + 4 + (i * 4)));
        if (value === -32768) value = null;
        if (i < 26) entry.parameters[String.fromCharCode(65 + i)] = value;
        else entry.parameters[String.fromCharCode(Math.floor(i / 26) + 64, 65 + i - 26)] = value;
    }
}


function checkDigit(line) {
    var checkDigit = 0;
    for (var i = 0; i < line.length; i = i + 2) {
        checkDigit ^= parseInt('0x' + line[i] + line[i + 1]);
    }
    if (checkDigit === 0) return true;
    return false;
}

function convertSignedIntHexa(hexa) {
    var value = parseInt('0x' + hexa);
    if (value > 32767) {
        return (65536 - value) * -1;
    }
    return value;
}
