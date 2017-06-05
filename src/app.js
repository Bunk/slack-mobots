const handlers = require( "./handlers" );
const bot = require( "./bot" );
const logger = require( "./services/logger" );
const colors = require( "./services/colors" );
const git = require( "./services/git" );

module.exports = ( config, pkg ) => {
	const app = {
		config, pkg, colors,
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

	app.git = git( app );

	return app;
};
