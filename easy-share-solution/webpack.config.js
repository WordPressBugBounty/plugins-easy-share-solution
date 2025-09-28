const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
    entry: {
        admin: path.resolve(process.cwd(), 'src/admin', 'index.js'),
        'share-block/index': path.resolve(process.cwd(), 'src/share-block', 'index.js'),
    },
    resolve: {
        ...defaultConfig.resolve,
        alias: {
            ...defaultConfig.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        },
    },
};
