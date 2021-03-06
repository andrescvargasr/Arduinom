'use strict';

function idStringToNumber(idString) {
    if (idString === undefined) return undefined;

    if (idString.length === 2) {
        return idString.charCodeAt(0) * 256 + idString.charCodeAt(1);
    } else {
        throw new Error('Id does not have the expected 2 char format');
    }
    //return idString;
}

function idNumberToString(idNumber) {
    return String.fromCharCode(idNumber / 256 | 0) + String.fromCharCode(idNumber % 256);
}

module.exports = {
    deviceIdStringToNumber: idStringToNumber,
    deviceIdNumberToString: idNumberToString,
    addCheckDigit: addCheckDigit
};

function addCheckDigit(str) {
    if (!(typeof str === 'string')) throw new TypeError('addCheckDigit expects a string');
    var checkDigit = 0;
    for (var i = 0; i < str.length; i++) {
        checkDigit ^= str.charCodeAt(i);
    }
    return str + String.fromCharCode(checkDigit);
}
