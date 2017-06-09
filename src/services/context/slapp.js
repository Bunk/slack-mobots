const _ = require( "lodash" );
const promisify = require( "es6-promisify" );

module.exports = ( app ) => {
	return ( msg ) => {
		const { slapp } = app;
		const meta = _.mapKeys( msg.meta, ( value, key ) => _.camelCase( key ) );
		return {
			meta,
			say( ...opt ) {
				return promisify( msg.say, msg )( ...opt );
			},
			respond( ...opt ) {
				if ( !msg.body.response_url ) {
					return this.say( ...opt );
				}
				return promisify( msg.respond, msg )( ...opt );
			},
			fetchUser() {
				return new Promise( ( resolve, reject ) => {
					slapp.client.users.info( { token: meta.botToken, user: meta.userId }, ( err, data ) => {
						if ( err ) {
							return reject( err );
						}
						return resolve( data );
					} );
				} );
			}
		};
	};
};
