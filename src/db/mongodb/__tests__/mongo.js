'use strict';

const Mongo = require('../Mongo');

test('mongo database', async () => {

    var db = new Mongo(1234567890, {});
    await db.drop();

    await expect(db.getLastSequenceId()).resolves.toBe(0);

    // insert some data
    let data = [];
    for (let i = 0; i < 100; i++) {
        data.push({
            _id: String(i + 10),
            id: i,
            A: 1,
            B: 2
        });
    }

    await db.saveEntries(data);

    await expect(db.getNumberEntries()).resolves.toBe(100);

    await expect(db.getLastSequenceId()).resolves.toBe(99);

    var entries = await db.getAllEntries();
    expect(entries.length).toBe(100);

    await expect(entries[0]).toEqual({_id: '10',
        id: 0,
        A: 1,
        B: 2});

});
