/* eslint-disable global-require */
module.exports = ( app ) => ( context ) => {
	const git = app.git( context );
	return {
		...require( "./releases" )( app, git ),
		...require( "./users" )( app, git ),
		async getAvailableBranches( state ) {
			let results = await git.repos( state.repo.user, state.repo.name ).branches.fetch();

			state.branches = results.items.map( i => i.name );
			while ( results.nextPage ) {
				results = await results.nextPage();
				state.branches.push( ...results.items.map( i => i.name ) );
			}
		}
	};
};
