const yargs = require( "yargs-parser" );
const shortid = require( "shortid" );
const semver = require( "semver" );
const fsmFactory = require( "./fsm" );

module.exports = ( app ) => {
	const { slapp, context, utils } = app;
	const fsm = fsmFactory( app );

	slapp.message( /create release(.*)/i, [ "direct_message", "direct_mention", "mention" ], ( msg, opt ) => {
		const params = opt.trim()
			.replace( /[\u2018\u2019]/g, "'" )	// replace fancy single-quotes
			.replace( /[\u201C\u201D]/g, '"' );	// replace fancy double-quotes
		const parsed = yargs( params );
		const { name, version } = parsed;
		const { notes = name, platform = "ios,android", branch = "develop" } = parsed;
		let { repo = "BanditSoftware/leankit-mobile" } = parsed;

		function showHelp( validation ) {
			return msg.say( `${ validation }\n\n` +
				"> Usage:  `create release --name=\"Some name\" --version=1.1.1" +
				" --platform=ios --notes=\"comma,delimited,list of notes\"`" );
		}

		if ( !name ) {
			return showHelp( "A release name is required." );
		}
		if ( version && !semver.valid( version ) ) {
			return showHelp( "A semantic release version is required." );
		}

		repo = repo.split( "/" );
		repo = { user: repo[ 0 ], name: repo[ 1 ] };

		const state = {
			repo,
			id: `${ msg.meta.team_id }|mobile|release|${ shortid.generate() }`,
			versions: {
				latest: version
			},
			branches: {
				current: branch
			},
			answers: {
				name, version,
				versionBump: !!version,
				notes: notes.split( "," ).map( v => v.trim() ),
				platforms: platform.split( "," ).map( v => v.trim() )
			}
		};
		fsm.lookupOrCreate( state.id, () => state )
			.then( api => api.start( context( msg ) ) )
			.catch( utils.onError( context( msg ) ) );
	} );

	slapp.action( "tag-release", "cancel", ( msg, data ) => {
		const { id } = JSON.parse( data );
		const ctx = context( msg );
		fsm.lookupOrCreate( id )
			.then( api => api.cancel( ctx ) )
			.catch( utils.onError( context( msg ) ) );
	} );

	[ "confirm_version_bump", "confirm_release" ].forEach( action => {
		slapp.action( "tag-release", action, ( msg, data ) => {
			const { id, key, value } = JSON.parse( data );
			const ctx = context( msg );
			fsm.lookupOrCreate( id )
				.then( api => api.answer( ctx, { key, value } ) )
				.catch( utils.onError( context( msg ) ) );
		} );
	} );
};
