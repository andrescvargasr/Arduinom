'use strict';

const router = require('koa-router')({prefix: '/db'});
const connection = require('../../db/connection');

router.get('/:collection/entries', async function(ctx) {
    ctx.body = await connection.getEntries(ctx.params.collection, ctx.query);
});

module.exports = router;
