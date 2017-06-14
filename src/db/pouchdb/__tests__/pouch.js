const Pouch = require('../Pouch');

test('pouch database', async () => {

    var db=new Pouch(1234, {
        adapter: 'memory'
    });
    await expect(db.getLastSequenceId()).resolves.toBe(0);

    // insert some data
    let data=[];
    for (let i=0; i<100; i++) {
        data.push({
            _id: String(i),
            A:1,
            B:2
        });
    }

    await db.saveEntries(data);

    await expect(db.getNumberEntries()).resolves.toBe(100);

    await expect(db.getLastSequenceId()).resolves.toBe(99);



});
