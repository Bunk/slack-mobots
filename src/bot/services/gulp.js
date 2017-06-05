const _ = require( "lodash" );

function escapeQuotes( val = "" ) {
	return val.replace( /"/g, '\\"' );
}

module.exports = ( { config, log, shell } ) => ( cwd ) => {
	const api = {
		createRelease( version, platform, comments ) {
			let notes = _.map( comments.split( "," ), m => _.trim( m ) );
			const name = notes.shift();

			// When there are no supplied notes, add the release as one
			if ( !notes.length ) {
				notes = [ name ];
			}

			notes = _.map( notes, s => `> ${ s }` ).join( "\n" );

			return { version, platform, name, notes };
		},
		tagRelease( release, { token, dryrun } ) {
			log.info( { release }, `Preparing version ${ release.version } for release` );

			const args = [
				"tag-release",
				"--versionnumber", release.version,
				"--releasename", escapeQuotes( release.name ),
				"--releasebody", escapeQuotes( release.notes )
			];

			if ( dryrun ) {
				args.push( "--dryrun" );
			}

			if ( release.platform ) {
				args.push( "--platform", release.platform );
			}

			const env = Object.assign( {}, process.env, { GITHUB_API_TOKEN: token } );
			return shell.exec( "gulp", args, { cwd, env } );
		}
	};
	return api;
};
