const config = require( "./config" );
const appFactory = require( "./app" );
const pkg = require( "../package.json" );

module.exports = appFactory( config, pkg ).start();
