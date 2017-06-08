const _ = require( "lodash" );
const semver = require( "semver" );
const githubSteps = require( "./github" );
const chatSteps = require( "./chat" );

module.exports = ( app ) => {
	const { storage } = app;
	return {
		github: githubSteps( app ),
		chat: chatSteps( app ),
		bumpVersion( state ) {
			const { versions: { latest }, answers: { versionBump } } = state;
			const bumped = semver.inc( latest, versionBump );
			if ( !bumped ) {
				throw new Error( `Couldn't bump version '${ latest }' as a ${ versionBump } release` );
			}
			_.set( state, "versions.current", bumped );
		},
		createRelease( state ) {
			function emojisize( platform ) {
				if ( /^ios$/i.test( platform ) ) {
					return ":ios:";
				}
				if ( /^android$/i.test( platform ) ) {
					return ":android:";
				}
				return platform;
			}

			_.set( state, "release", {
				name: state.answers.name,
				notes: state.answers.notes.map( v => `* ${ v }` ).join( "\n" ),
				platforms: state.answers.platforms.map( emojisize ).join( " " ),
				version: state.versions.current,
				tag: `v.${ state.versions.current }`,
				target: state.branches.current
			} );
		},
		storeState( state ) {
			return storage.set( state.id, state );
		},
		async deleteState( state ) {
			if ( state && state.id ) {
				await storage.del( state.id );
			}
		}
	};
};
