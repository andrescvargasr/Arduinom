'use strict';

const router = require('koa-router')({prefix: '/db'});

router.get('/all', async function(ctx) {
    ctx.body = 'ok';
});

module.exports = router;
