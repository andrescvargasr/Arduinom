'use strict';

const router = require('koa-router')({prefix: '/db'});
const collections = require('../../db/collections');

router.get('/:collection/entries', async function(ctx) {
    const collection = await collections(ctx.params.collection);
    ctx.body = await collection.getEntries(ctx.query);
});

module.exports = router;
