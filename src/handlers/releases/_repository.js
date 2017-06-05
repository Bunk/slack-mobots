/* eslint-disable camelcase, no-magic-numbers, max-lines */
const IM_CHANGE_BRANCH = "im_change_branch";

const blockTemplate = val => `\`\`\`\n${ val }\n\`\`\``;

module.exports = ( { config, log, git, controller } ) => {
	function gitAttachment( opt ) {
		return {
			...opt,
			footer: "git",
			footer_icon: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
			ts: Math.round( Date.now() / 1000 )
		};
	}

	controller.hears(
		[
			/what branch are you (on|using|looking at)\??/i,
			/current branch/i
		],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const repo = await bot.openRepository();
			const branch = await repo.getCurrentBranch();
			bot.reply( message, {
				attachments: [ gitAttachment( {
					text: `I'm currently using: \`${ branch }\``,
					mrkdwn_in: [ "text" ]
				} ) ]
			} );
		}
	);

	controller.hears(
		[
			/(what|which) branches are available(?: on(?: remote)? (\S+))?/i,
			/show branches(?: on(?: remote)? (\S+))?/i
		],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const repo = await bot.openRepository();
			const remote = message.match[ 2 ]; // eslint-disable-line no-magic-numbers
			const remotes = await repo.getBranches( remote || "upstream" );
			const currentBranch = await repo.getCurrentBranch();

			bot.reply( message, {
				fallback: `I found these branches: \`${ remotes.join( ", " ) }\``,
				pretext: "I found these branches:",
				text: blockTemplate( remotes.join( "\n" ) ),
				attachments: [ gitAttachment( {
					text: `I'm currently using: \`${ currentBranch }\`.  Would you like to switch?`,
					callback_id: IM_CHANGE_BRANCH,
					attachment_type: "default",
					actions: [ {
						name: "branch",
						text: "Switch to branch...",
						color: "#3AA3E3",
						type: "select",
						options: remotes.map( ( value ) => ( { text: value, value } ) )
					} ],
					mrkdwn_in: [ "text", "pretext" ]
				} ) ]
			} );
		}
	);

	controller.hears(
		[
			/switch branch(?:es)?$/i
		],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const repo = await bot.openRepository();
			const remotes = await repo.getBranches( "upstream" );
			bot.reply( message, {
				attachments: [ gitAttachment( {
					text: "Which branch would you like to use?",
					callback_id: IM_CHANGE_BRANCH,
					attachment_type: "default",
					actions: [ {
						name: "branch",
						text: "Switch to branch...",
						color: "#3AA3E3",
						type: "select",
						options: remotes.map( ( value ) => ( { text: value, value } ) )
					} ],
					mrkdwn_in: [ "text", "pretext" ]
				} ) ]
			} );
		}
	);

	controller.hears(
		[
			/switch branch(?:es)? to (.+)$/i,
			/use branch (.+)$/i
		],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const branch = message.match[ 1 ];
			const repo = await bot.openRepository();
			const currentBranch = await repo.checkout( branch ).then( () => repo.getCurrentBranch() );
			bot.reply( message, {
				attachments: [ gitAttachment( {
					text: `I've switched to branch: \`${ currentBranch }\``,
					fallback: `I've switched to branch: \`${ currentBranch }\``,
					mrkdwn_in: [ "text" ]
				} ) ]
			} );
		}
	);

	controller.on( "interactive_message_callback", async ( bot, message ) => {
		if ( message.callback_id === IM_CHANGE_BRANCH ) {
			const repo = await bot.openRepository();
			const selected = message.actions[ 0 ].selected_options[ 0 ];
			const branch = await repo.checkout( selected.value ).then( () => repo.getCurrentBranch() );
			bot.replyInteractive( message, {
				attachments: [ {
					pretext: `I've switched to branch: \`${ branch }\``,
					footer: "git",
					footer_icon: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
					mrkdwn_in: [ "text", "pretext" ],
					ts: Math.round( Date.now() / 1000 )
				} ]
			} );
		}
	} );
};
