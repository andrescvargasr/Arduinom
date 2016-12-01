'use strict';

function _setMethods(methods, constructor, socket) {
    for (let method of methods) {
        if (!(method.startsWith('_') || method === 'constructor')) {
            constructor.prototype[method] = function () {
                //here this corresponds to the scope of the class constructor that is called (eg OpenBio)
                //this is why we can access the instance id using this context
                var that = this;
                var args = Array.from(arguments);
                return new Promise(function (resolve, reject) {
                    debug('calling method: ', method);
                    socket.emit('request', {
                        id: that.id,
                        method: method,
                        type: 'method',
                        args
                    }, function (data) {
                        if (data.status === 'success') {
                            resolve(data.data);
                        } else {
                            reject(new Error(data.error));
                        }
                    });
                });
            }
        }
    }
}

function _setStaticMethods(staticMethods, constructor, socket) {
    for (let method of staticMethods) {
        if (!(method.startsWith('_') || method === 'constructor')) {
            constructor[method] = function () {
                //here this corresponds to the scope of the class constructor that is called (eg OpenBio)
                var that = this;
                var args = Array.from(arguments);
                return new Promise(function (resolve, reject) {
                    console.log('calling static: ', method);
                    socket.emit('request', {
                        id: that.id,
                        method: method,
                        type: 'static-method',
                        args
                    }, function (data) {
                        if (data.status === 'success') {
                            resolve(data.data);
                        } else {
                            reject(new Error(data.error));
                        }
                    });
                });
            }
        }
    }

}

exports.staticMethods = _setStaticMethods();
exports.methods = _setMethods();