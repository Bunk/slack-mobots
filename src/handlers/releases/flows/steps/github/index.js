/* eslint-disable global-require */
module.exports = ( app ) => ( context ) => {
	const git = app.git( context );
	return {
		...require( "./releases" )( app, git ),
		...require( "./users" )( app, git )
	};
};
