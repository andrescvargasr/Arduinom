const Pouch = require('../Pouch');

test('pouch database', () => {

    var db=new Pouch(1234, {
        adapter: 'memory'
    });
    expect(db.getLastSequenceId()).resolves.toBe(0);


    // insert some data
    let data=[];
    for (let i=0; i<100; i++) {
        data.push({
            _id: i,
            A:1,
            B:2
        });
    }

    db.saveEntries(data);

    expect(db.getNumberEntries()).resolves.toBe(100);

});
