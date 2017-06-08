const Octokat = require( "octokat" );

const clientCache = {};

module.exports = ( { config, advice } ) => {
	return ( context ) => {
		const key = context.meta.teamId;
		if ( !clientCache[ key ] ) {
			const token = config.github.token || context.meta.config.GITHUB_TOKEN;
			clientCache[ key ] = new Octokat( { token } );
		}
		return clientCache[ key ];
	};
};
