const yargs = require( "yargs-parser" );
const shortid = require( "shortid" );
const semver = require( "semver" );
const fsmFactory = require( "./fsm" );

module.exports = ( app ) => {
	const { slapp, utils: { slack }, context } = app;
	const fsm = fsmFactory( app );

	slapp.message( /create release(.*)/i, [ "direct_message", "direct_mention", "mention" ], async ( msg, opt ) => {
		function showHelp( validation ) {
			return app.context( msg ).respond( {
				text: validation || "",
				attachments: [ {
					title: "Usage: create release --name=\"Some name\"",
					text: slack.preformatted(
						"Options:\n\t--version=1.1.1\n" +
						"\t--branch=develop\n" +
						"\t--bump=patch\n" +
						"\t--notes=\"Comma-delimeted, list of, notes\"\n" +
						"\t--platform=ios,android"
					),
					mrkdwn_in: [ "title", "text" ]
				} ]
			} );
		}

		try {
			const params = opt.trim()
				.replace( /[\u2018\u2019]/g, "'" )	// replace fancy single-quotes
				.replace( /[\u201C\u201D]/g, '"' );	// replace fancy double-quotes
			const parsed = yargs( params );
			const { name, version, branch, bump, help } = parsed;
			const { notes = name, platform = "ios,android" } = parsed;
			let { repo = "BanditSoftware/leankit-mobile" } = parsed;

			if ( help ) {
				return await showHelp();
			}
			if ( !name ) {
				return await showHelp( "A release name is required." );
			}
			if ( version && !semver.valid( version ) ) {
				return await showHelp( "A semantic release version is required.  http://semver.org/" );
			}

			repo = repo.split( "/" );
			repo = { user: repo[ 0 ], name: repo[ 1 ] };

			const state = {
				repo,
				id: `${ msg.meta.team_id }|mobile|release|${ shortid.generate() }`,
				answers: {
					name, version,
					versionBump: bump || !!version,
					notes: notes.split( "," ).map( v => v.trim() ),
					platforms: platform.split( "," ).map( v => v.trim() ),
					selectedBranch: branch
				}
			};
			return await fsm.lookupOrCreate( state.id, () => state )
				.then( api => api.start( app.context( msg ) ) )
				.catch( slack.onError( context( msg ) ) );
		} catch ( err ) {
			return slack.onError( context( msg ) )( err );
		}
	} );

	slapp.action( "tag-release", "cancel", ( msg, data ) => {
		const { id } = JSON.parse( data );
		const ctx = context( msg );
		fsm.lookupOrCreate( id )
			.then( api => api.cancel( ctx ) )
			.catch( slack.onError( context( msg ) ) );
	} );

	[ "confirm_version_bump", "confirm_release", "selected_branch" ].forEach( action => {
		slapp.action( "tag-release", action, ( msg, data ) => {
			const { id, key, value } = JSON.parse( data );
			const ctx = context( msg );
			fsm.lookupOrCreate( id )
				.then( api => api.answer( ctx, { key, value } ) )
				.catch( slack.onError( context( msg ) ) );
		} );
	} );
};
