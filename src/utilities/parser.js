'use strict';

var debug = require('debug')('main: parser');
var util = require('./util');
var opSpectro = require('open-spectro');


// TODO: review this file completly!!
module.exports = {
    parseMultiLog(lines, options) {
        var numberLogParameters = options.numberLogParameters;
        var lineLength = numberLogParameters * 4 + 22 + 8;
        return processLinesM(lines, lineLength, numberLogParameters);
    },
    parseCompactLog(line, options) {
        var numberParameters = options.numberParameters;
        var lineLength = numberParameters * 4 + 14;
        return processStatusLine(line, lineLength, numberParameters);
    }
};


function processLinesM(lines, reqLength, nbParam, hasEvent) {
    var entries = [];
    for (var i = 0; i < lines.length; i++) {
        if (i === 0) {
            debug('first processed line', JSON.stringify(lines[0]));
        }
        var line = lines[i];
        var entry = processStatusLineM(line, reqLength, nbParam, hasEvent);
        if (entry) entries.push(entry);
    }
    // Check that all entries come from the same device!!
    if (entries.length > 0) {
        var deviceId = entries[0].deviceId;
        for (i = 1; i < entries.length; i++) {
            if (entries[i].deviceId !== deviceId) {
                debug('checkdigit is ok but all lines did not come from the same device. There are at least 2 device ids: ' + entries[0].deviceId + ', ' + entries[i].deviceId);
                throw new Error('all lines do not have the same id');
            }
        }
    }
    return entries;
}


function processStatusLine(line, lineLength, numberParameters) {
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

function processStatusLineM(line, lineLength, numberParameters) {
    const entry = {};
    if (lineLength && line.length !== lineLength) {
        debug('Unexpected response length: ', line.length, 'instead of ', lineLength);
        throw new Error('Unexpected response length');
    }

    if (checkDigit(line)) {
        entry.id = parseInt('0x' + line.substring(0, 8));
        entry.epoch = parseInt('0x' + line.substring(8, 16));
        parseParameters(line, 16, numberParameters, entry);

        entry.event=convertSignedIntHexa(line.substring(16 + numberParameters * 4, 16 + numberParameters * 4 + 4));
        entry.eventValue=convertSignedIntHexa(line.substring(16 + numberParameters * 4 + 4, 16 + numberParameters * 4 + 4 + 4));

        entry.deviceId = convertSignedIntHexa(line.substring(16 + numberParameters * 4 + 8, 16 + numberParameters * 4 + 8 + 4));
        if (!entry.deviceId) {
            throw new Error('Could not parse device id in processStatusLineM');
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
        else entry.parameters[String.fromCharCode(Math.floor(i/26)+64, 65 + i - 26)] = value;
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
