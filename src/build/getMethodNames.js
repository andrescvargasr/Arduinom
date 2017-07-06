'use strict';
const EventEmitter = require('events');
const excluded = Object.getOwnPropertyNames(Function()).concat('constructor');

function getMethods(constructor, methodList) {
    if (!methodList) {
        methodList = {
            static: new Set(),
            methods: new Set()
        };
    }
    if (constructor !== Object && constructor !== EventEmitter) {
        const methods = exclude(Object.getOwnPropertyNames(constructor.prototype));
        methods.forEach(method => methodList.methods.add(method));
        const staticMethods = exclude(Object.getOwnPropertyNames(constructor));
        staticMethods.forEach(method => methodList.static.add(method));
        getMethods(constructor.prototype.__proto__.constructor, methodList);
    }
    return {
        static: Array.from(methodList.static),
        methods: Array.from(methodList.methods)
    };
}

function exclude(methods) {
    return methods.filter(method => !method.startsWith('_') && excluded.indexOf(method) === -1);
}


module.exports = getMethods;
