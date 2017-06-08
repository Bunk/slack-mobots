const _ = require( "lodash" );

module.exports = ( app, git ) => {
	return {
		async validateAccess( state ) {
			const repository = `${ state.repo.user }/${ state.repo.name }`;
			const repo = git.repos( state.repo.user, state.repo.name );
			try {
				const user = await git.user.fetch();
				_.set( state, "user.github", { name: user.name, login: user.login, icon: user.avatarUrl } );
			} catch ( err ) {
				throw new Error( "Unable to authorize with the current GitHub token" );
			}

			try {
				await repo.fetch();
			} catch ( err ) {
				throw new Error( `Unable to find repository '${ repository }'.  Make sure it's spelled correctly and that you have access.` );
			}

			try {
				await repo.collaborators( state.user.github.login ).fetch();
			} catch ( err ) {
				throw new Error( `You don't have push access to '${ repository }'` );
			}
		}
	};
};
