const _ = require( "lodash" );
const semver = require( "semver" );

module.exports = ( app, git ) => {
	return {
		async getLatestVersion( state ) {
			const { tagName } = await git.repos( state.repo.user, state.repo.name ).releases.latest.fetch();
			_.set( state, "versions.latest", semver.clean( tagName.replace( /v?\.?(.*)+/, "$1" ) ) );
			_.set( state, "tags.version", tagName );
		},
		async release( state ) {
			const repo = git.repos( state.repo.user, state.repo.name );
			const { htmlUrl } = await repo.releases.create( {
				tag_name: state.release.tag,
				target_commitish: state.release.target,
				name: state.release.name,
				body: state.release.notes.replace( /(['])/g, "\\u0027" )
			} );

			_.set( state, "release.url", htmlUrl );
		}
	};
};
