const Octokat = require( "octokat" );

const clientCache = {};

module.exports = ( { config, advice } ) => {
	function create( token ) {
		return new Octokat( { token } );
	}

	return ( key, token ) => {
		if ( !clientCache[ key ] ) {
			clientCache[ key ] = create( token );
		}
		return clientCache[ key ];
	};
};
