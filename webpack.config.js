const path = require('path');

module.exports = {
    mode: "development",
    devtool: 'source-map',
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    }
};