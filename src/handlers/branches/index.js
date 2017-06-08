module.exports = ( app ) => {
	const { slapp, context, utils } = app;

	slapp.message( /show branches/i, [ "direct_message", "direct_mention", "mention" ], ( msg ) => {
		const ctx = context( msg );
		const git = app.git( ctx );
		git.repos( "BanditSoftware", "leankit-mobile" ).branches.fetch()
			.then( async results => {
				const branches = results.items.map( i => i.name );
				while ( results.nextPage ) {
					results = await results.nextPage();
					branches.push( ...results.items.map( i => i.name ) );
				}

				await ctx.respond( {
					fallback: `I found these branches: \`${ branches.join( ", " ) }\``,
					pretext: "I found these branches:",
					text: utils.slack.blockTemplate( branches.join( "\n" ) ),
					attachments: [ utils.slack.gitAttachment( {
						text: "I'm currently using: `develop`.  Would you like to switch?",
						callback_id: "branch_switch",
						attachment_type: "default",
						actions: [ {
							name: "branch",
							text: "Switch to branch...",
							color: "#3AA3E3",
							type: "select",
							options: branches.map( ( value ) => ( { text: value, value } ) )
						} ],
						mrkdwn_in: [ "text", "pretext" ]
					} ) ]
				} );
			} )
			.catch( utils.slack.onError( ctx ) );
	} );
};
