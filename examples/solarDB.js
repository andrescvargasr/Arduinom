const Pouch = require('../src/db/pouchdb/Pouch');

dbInfo();

async function dbInfo() {

    let db=new Pouch(9025);

    let numberEntries = await db.getLastSequenceId();
    console.log('Number entries',numberEntries);

    let entries = await db.getAllEntries();

    // entries=entries.slice(0,5);

    // console.log(entries);
   //  entries.forEach(a => console.log(a.value))

}
