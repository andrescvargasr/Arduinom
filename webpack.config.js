'use strict';

const path = require('path');

module.exports = {
    entry: './src/client/index.js',
    output: {
        path: path.join(__dirname, 'src/public/'),
        filename: 'app.js',
        libraryTarget: 'window',
        library: 'arduinom'
    },
    module: {
        rules: [
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    }
};