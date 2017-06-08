/* eslint-disable global-require */
module.exports = ( app ) => ( context ) => {
	const { config } = app;
	const key = context.meta.teamId;
	const token = config.github.token || context.meta.config.GITHUB_TOKEN;

	const git = app.git( key, token );
	return {
		...require( "./releases" )( app, git ),
		...require( "./users" )( app, git )
	};
};
