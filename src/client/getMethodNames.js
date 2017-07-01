'use strict';
const EventEmitter = require('events');
const excluded = Object.getOwnPropertyNames(Function());
const maxDepth = 5;
let depth = 0;

function getMethods(constructor, methodList) {
    if(!methodList) {
        methodList = {
            static: new Set(),
            methods: new Set()
        };
    }
    console.log('event emitter', EventEmitter.prototype === constructor.prototype);
    console.log('new prototype', constructor.prototype);
    if(constructor !== Object && constructor !== EventEmitter && depth < maxDepth) {
        depth++;
        const methods = exclude(Object.getOwnPropertyNames(constructor.prototype));
        methods.forEach(method => methodList.methods.add(method));
        const staticMethods = exclude(Object.getOwnPropertyNames(constructor));
        staticMethods.forEach(method => methodList.static.add(staticMethods));
        getMethods(constructor.prototype.__proto__.constructor, methodList);
    }
    return methodList;
}

function exclude(methods) {
    return methods.filter(method => excluded.indexOf(method) === -1);
}


module.exports = getMethods;