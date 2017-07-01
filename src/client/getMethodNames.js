'use strict';

const excluded = Object.getOwnPropertyNames(Function());

function getMethods(constructor, methodList) {
    if(!methodList) {
        methodList = {
            static: new Set(),
            methods: new Set()
        };
    }
    while(constructor.prototype !== Object.prototype) {
        const methods = exclude(Object.getOwnPropertyNames(constructor.prototype));
        methods.forEach(method => methods.methods.add(method));
        const staticMethods = exclude(Object.getOwnPropertyNames(constructor));
        staticMethods.forEach(method => methods.static.add(staticMethods));
        getMethods(constructor.prototype.__proto__.constructor, methodList);
    }
}

function exclude(methods) {
    return methods.filter(method => excluded.indexOf(method) > -1);
}


module.exports = getMethods;