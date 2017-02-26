'use strict';

const MongoClient = require('mongodb').MongoClient;
const createCollection = false;

const url = 'mongodb://localhost:27017/mongo_test';

// test();

function getCyclicData(options) {
    const interval = (options.to - options.from) / options.n;
    return Array.from({length: options.n})
        .map((v, i) => {
            const noise = (Math.random() - 0.5) * 2 * options.noiseLevel;
            const d = (i * interval) % options.period;
            const date = new Date((options.from + i * interval));
            return {
                epoch: date.getTime(),
                A: options.mean + options.amplitude * Math.sin(d / options.period * 2 * Math.PI) + noise,
            }
        })
}

function createIndex(db) {
    return getCollection(db).createIndex({ epoch: 1});
}

function getCollection(db) {
    return db.collection('cyclic');
}

function insertDocuments(db) {
    if (createCollection) {
        var collection = db.collection('cyclic');
        return collection.drop().then(() => {
            return collection.insertMany(getCyclicData({
                n: 100000,
                from: Date.now() - 10000000000,
                to: Date.now(),
                mean: 3,
                noiseLevel: 0.5,
                amplitude: 5,
                period: 100000
            }))
        })
        .then(() => {
            return createIndex(db);
        });
    } else {
        return Promise.resolve();
    }

}

const middle = 1484000859402;
function queryPoints(db) {
    return function () {
        const collection = getCollection(db);
        return collection.aggregate([
            // {
            //     // $match: {A: {$lt:3}}
            //     $match: {
            //         date: {
            //             $gt: new Date(middle),
            //             $lt: new Date(middle + 10000000)
            //         }
            //     }
            // },
            {
                $group: {
                    _id: {
                        epoch: {
                            $subtract: ["$epoch", {
                                $mod: ["$epoch", 3600000]
                            }]
                        }
                    },
                    average: {
                        $avg: "$A"
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ]).toArray();
    }
}

function timerStart(label) {
    return function (arg) {
        console.time(label);
        return arg;
    }
}

function timerStep(label) {
    return function (arg) {
        console.timeEnd(label);
        console.time(label);
        return arg;
    }
}

function timerStop(label) {
    return function (arg) {
        console.timeEnd(label);
        return arg;
    };
}
MongoClient.connect(url)
    .then(db => {
        return insertDocuments(db)
            .then(timerStart('query'))
            .then(queryPoints(db))
            .then(timerStep('query'))
            .then(queryPoints(db))
            .then(timerStop('query'))
            .then(data => {
                console.log('done', data);
                db.close();
            });
    })
    .catch(err => {
        console.log('error', err);
    });


function test() {
    MongoClient.connect(url).then(db => {
        const collection = db.collection('cyclic');
        const x = collection.find({}, {_id: 0, epoch: 1}).sort({epoch: 1}).limit(1).toArray().then(data => console.log(data));
        console.log('x', x);
        db.close();
    });

}


