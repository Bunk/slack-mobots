/* eslint-disable max-lines */
const _ = require( "lodash" );
const yargs = require( "yargs-parser" );
const semver = require( "semver" );

const IM_RELEASE_CREATE = "release_create";
const IM_RELEASE_VERSION = "release_version";

module.exports = ( { config, colors, log, git, gulp, controller } ) => {
	function updateFields( message, { name, version, platform, notes } ) {
		if ( name ) {
			message.attachments[ 0 ].text = `*${ name }*`;
		}
		if ( notes ) {
			const releaseNotes = notes.split( "," ).map( note => `* ${ note.trim() }` ).join( "\n" );
			message.attachments[ 0 ].fields.push(
				{ value: releaseNotes, short: false }
			);
		}
		if ( platform ) {
			const platformEmoji = ( platform === "all" ) ? ":ios: :android:" : `:${ platform }:`;
			message.attachments[ 0 ].fields.push(
				{ title: "Platform", value: platformEmoji, short: true }
			);
		}
		if ( version ) {
			message.attachments[ 0 ].fields.push(
				{ title: "Version", value: version, short: true }
			);
		}
		return message;
	}

	function collectFields( message ) {
		const att = message.attachments[ 0 ];
		const transformPlatform = ( emoji ) => {
			if ( emoji ) {
				const ios = _.includes( emoji, ":ios:" );
				const android = _.includes( emoji, ":android:" );
				if ( ios && !android ) {
					return "ios";
				} else if ( !ios && android ) {
					return "android";
				}
			}
			return "all";
		};
		const value = ( title ) => {
			return ( _.find( att.fields, { title } ) || {} ).value;
		};
		return {
			name: _.replace( att.text, /[*]/gi, "" ),
			platform: transformPlatform( value( "Platform" ) ),
			version: value( "Version" ),
			notes: value( "" )
		};
	}

	function interactiveRelease( message ) {
		message.attachments[ 0 ].pretext = "Does this look correct?";
		message.attachments[ 0 ].callback_id = IM_RELEASE_CREATE;
		message.attachments[ 0 ].actions = [
			{ name: "send", text: "Send to HockeyApp", type: "button", style: "primary", value: "send" },
			{ name: "cancel", text: "Cancel", type: "button", style: "danger", value: "cancel",
				confirm: {
					title: "Cancel Release", text: "Are you sure you want to cancel this release?", ok_text: "Okay", dismiss_text: "Cancel"
				}
			}
		];
		return message;
	}

	function interactiveVersion( message ) {
		message.attachments[ 0 ].pretext = "Please specify a `semantic version` bump";
		message.attachments[ 0 ].callback_id = IM_RELEASE_VERSION;
		message.attachments[ 0 ].actions = [
			{ name: "major", text: "Major", type: "button", style: "default", value: "major" },
			{ name: "minor", text: "Minor", type: "button", style: "default", value: "minor" },
			{ name: "patch", text: "Patch", type: "button", style: "default", value: "patch" }
		];
		return message;
	}

	function interactiveUpdate( message, status ) {
		const updated = Object.assign( {}, message.original_message );
		updated.attachments[ 0 ] = Object.assign( {}, updated.attachments[ 0 ], {
			pretext: status
		} );
		return updated;
	}

	async function nextVersion( github, inc = "major" ) {
		const repo = github.hub().getRepo( github.user, github.name );
		const { data } = await repo.listReleases();

		const { tag_name } = ( data && data.length ) ? data[ 0 ] : null;
		if ( !tag_name ) {
			return "1.0.0";
		}

		const version = semver.clean( _.replace( tag_name, "v.", "" ) );
		return semver.inc( version, inc );
	}

	async function tagRelease( bot, release, { dryrun = false } ) {
		// Prep the repository
		const repo = await bot.openRepository( "upstream" );
		const currentBranch = await repo.getCurrentBranch();
		await repo.mergeUpstream( currentBranch );

		// Tag the release with gulp
		const { token } = git( "upstream" );
		await gulp( repo.dir ).tagRelease( release, { token, dryrun } );
		log.info( { release }, "Succesfully tagged version" );
	}

	controller.hears(
		[ /^create release(.*)$/ ],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const params = message.match[ 1 ].trim();
			const parsed = yargs( params );
			const { name, version, platform = "all", notes } = parsed;

			function showHelp( validation ) {
				return bot.reply( message, `${ validation }\n\n` +
					"> Usage:  `create release --name=\"Some name\" --version=1.1.1" +
					" --platform=ios --notes=\"comma,delimited,list of notes\"`" );
			}

			if ( !name ) {
				return showHelp( "A release name is required." );
			}
			if ( version && !semver.valid( version ) ) {
				return showHelp( "A semantic release version is required." );
			}

			let releaseMessage = {
				attachments: [ {
					mrkdwn_in: [ "text", "pretext", "fields" ],
					attachment_type: "default",
					fields: [],
					actions: []
				} ]
			};

			releaseMessage = updateFields( releaseMessage, { name, version, platform, notes } );
			if ( !version ) {
				releaseMessage = interactiveVersion( releaseMessage );
			} else {
				releaseMessage = interactiveRelease( releaseMessage );
			}
			return bot.reply( message, releaseMessage );
		}
	);

	controller.on( "interactive_message_callback", async ( bot, message ) => {
		switch ( message.callback_id ) {
			case IM_RELEASE_CREATE: {
				const update = message.actions[ 0 ].value === "send";
				const original = message.original_message;
				await bot.replyInteractive( message, interactiveUpdate( message, "> Preparing the release..." ) );

				if ( update ) {
					const release = collectFields( original );
					await tagRelease( bot, release, { dryrun: false } );
				}

				original.attachments[ 0 ].actions = [];
				original.attachments[ 0 ] = Object.assign( original.attachments[ 0 ], {
					pretext: null,
					color: update ? colors.good : colors.bad,
					footer: `<@${ message.user }> ${ update ? "released" : "cancelled" }`,
					ts: Math.round( Date.now() / 1000 )
				} );

				await bot.replyInteractive( message, original );
				break;
			}
			case IM_RELEASE_VERSION: {
				const bump = message.actions[ 0 ].value;
				const upstream = git( "upstream" );
				const version = await nextVersion( upstream, bump );

				const updated = updateFields( message.original_message, { version } );
				await bot.replyInteractive( message, interactiveRelease( updated ) );
				break;
			}
			default:
				break;
		}
	} );

	controller.hears(
		[ /(test )?tag( android| ios)? release (\d+\.\d+\.\d+)((?:, [^,]+)+)/i ],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const dryrun = !!message.match[ 1 ];
			const platform = ( message.match[ 2 ] ).trim();
			const version = ( message.match[ 3 ] ).trim();
			const rest = ( ( message.match[ 4 ] ).substring( message.match[ 4 ].indexOf( "," ) + 1 ) ).trim();

			// Generate the release
			let notes = _.map( rest.split( "," ), m => _.trim( m ) );
			const name = notes.shift();
			if ( !notes.length ) {
				notes = [ name ];
			}
			notes = _.map( notes, s => `> ${ s }` ).join( "\n" );
			const release = { version, platform, name, notes };
			await tagRelease( bot, release, { dryrun } );

			// Respond
			const tag = `v.${ version }${ ( platform ? `+${ platform.trim() }` : "" ) }`;
			bot.reply( message, {
				attachments: [ {
					pretext: `${ release.name }`,
					fallback: `Tagged ${ tag } for release as "${ release.name }"`,
					title: `Tagged ${ tag }`,
					title_link: `https://github.com/BanditSoftware/leankit-mobile/releases/tag/${ tag }`,
					text: `${ release.notes }`,
					color: colors.good,
					fields: [
						{ title: "Version", value: version, short: true },
						{ title: "Tagged by", value: `<@${ message.user }>`, short: true }
					],
					footer: "github",
					footer_icon: "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png",
					mrkdwn_in: [ "text", "pretext" ],
					ts: Math.round( Date.now() / 1000 )
				} ]
			} );
		}
	);
};
