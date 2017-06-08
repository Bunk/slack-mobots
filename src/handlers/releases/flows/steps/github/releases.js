const _ = require( "lodash" );
const semver = require( "semver" );

module.exports = ( app, git ) => {
	return {
		async getLatestVersion( state ) {
			const { tagName } = await git.repos( state.repo.user, state.repo.name ).releases.latest.fetch();
			_.set( state, "versions.latest", semver.clean( tagName.replace( /v.(.*)+/, "$1" ) ) );
			_.set( state, "tags.version", tagName );
		},
		async createRelease( state ) {
			const repo = git.repos( state.repo.user, state.repo.name );

			state.release = {
				tag_name: `v${ state.versions.current }`,
				target_commitish: state.refs.current,
				name: state.answers.releaseName,
				body: state.answers.releaseLog.join( "\n" )
			};

			const { htmlUrl } = await repo.releases.create( state.release );
			_.set( state, "release.url", htmlUrl );
		}
	};
};
