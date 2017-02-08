'use strict';

const MongoClient = require('mongodb').MongoClient;
const createCollection = false;

const url = 'mongodb://localhost:27017/mongo_test';

function getCyclicData(options) {
    const interval = (options.to - options.from) / options.n;
    return Array.from({length: options.n})
        .map((v, i) => {
            const noise = (Math.random() - 0.5) * 2 * options.noiseLevel;
            const d = (i * interval) % options.period;
            const date = new Date((options.from + i * interval));
            return {
                date: date,
                A: options.mean + options.amplitude * Math.sin(d / options.period * 2 * Math.PI) + noise,
                day: date.getUTCDate(),
                month: date.getUTCMonth() + 1,
                hour: date.getHours(),
                year: date.getFullYear()
            }
        })
}

function createIndex(db) {
    return getCollection(db).createIndex({ year: 1, month: 1, day: 1, "A": 1});
}

function getCollection(db) {
    return db.collection('cyclic');
}

function insertDocuments(db) {
    if (createCollection) {
        var collection = db.collection('cyclic');
        return collection.drop().then(() => {
            return collection.insertMany(getCyclicData({
                n: 1000000,
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
                         day: "$day", month: "$month", year: "$year"
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
