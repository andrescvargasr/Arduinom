/**
 * Created by qcabrol on 10/25/16.
 */
"use strict"
var util = require("./util");
const OpenBio = require("./devices/OpenBio");
const OpenSpectro = require("./devices/OpenSpectro");
const device = require("./DeviceHandler");
const debug = require("debug")('main:serialdevices');

//polls the serial ports in search for an specific serial device every 3sec
var serialDBList = {};
var serialArray = [];
var serialDB = new pouchDB('serialData');
var ready;

//create a class for the correct device or link a serialQ back to its corresponding device
function createDevice(id) {
    var qualifierReg = /^([\x21-\x7A])([\x21-\x7A])$/;
    var id_string = util.deviceIdNumberToString(id);
    var m = qualifierReg.exec(id);
    switch (m[1]) {
        case '$':
            console.log('detected bioreactor with id:', id_string); //then create a filter fo device objects
            var bio = new OpenBio(id);
            return bio;
            break;
        case 'S':
            console.log('detected spectrophotometer with id:', id_string); //then create a filter fo device objects
            var spectro = new OpenSpectro(id);
            _initListeners(id);
            return spectro;
            break;
        default:
            console.log('detected unknown device with id:', id);
            return {};
            break;
    }
}