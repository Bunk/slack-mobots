const handlers = require( "./handlers" );
const bot = require( "./bot" );
const utils = require( "./services/utils" );
const advice = require( "./services/advice" );
const logger = require( "./services/logger" );
const colors = require( "./services/colors" );
const storage = require( "./services/storage" );
const context = require( "./services/context/slapp" );
const git = require( "./services/git" );

module.exports = ( config, pkg ) => {
	const app = {
		config, pkg, colors, advice, utils,
		log: logger( config ),
		start() {
			bot( app )
				.start( handlers( app ) )
				.then( () => app.log.info( "Bot started" ) )
				.catch( err => app.kill( err ) );
		},
		stop() {
			app.bot.destroy();
		},
		kill: /* istanbul ignore next */ ( err, msg ) => {
			app.log.fatal( err, msg );
			process.exit( 1 ); // eslint-disable-line no-process-exit
		}
	};

	app.context = context( app );
	app.storage = storage( app );
	app.git = git( app );

	return app;
};
