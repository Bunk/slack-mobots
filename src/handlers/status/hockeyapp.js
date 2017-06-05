const aupair = require( "aupair" );
const ApiDependency = require( "aupair-api" );

module.exports = ( { log, config } ) => {
	const dependency = new ApiDependency( {
		name: "HockeyApp",
		uri: "https://rink.hockeyapp.net/api/2",
		transforms: {
			request( options ) {
				return {
					...options,
					headers: { "X-HockeyAppToken": config.hockey.token }
				};
			},
			response( response ) {
				return {
					healthy: response.body.status === "success",
					message: response.body.version,
					timestamp: response.created_on
				};
			}
		}
	} );
	log.info( { dependency }, "Registered health monitor: Hockey App" );
	aupair.register( dependency );
};
