function attachment( footer ) {
	return ( opt ) => {
		return Object.assign( {}, footer, opt );
	};
}

const api = {
	slack: {
		preformatted: ( val ) => `\`\`\`\n${ val }\n\`\`\``,
		attachment: {
			git: attachment( {
				footer: "git",
				footer_icon: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
				ts: Math.round( Date.now() / 1000 )
			} ),
			github: attachment( {
				footer: "github",
				footer_icon: "https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png",
				ts: Math.round( Date.now() / 1000 )
			} )
		},
		encode( state, key, value ) {
			return JSON.stringify( { id: state.id, key, value } );
		},
		onError: ( ctx ) => ( err ) => {
			ctx.respond( {
				text: ":sweat: Woops!",
				attachments: [ {
					title: err.message,
					text: api.slack.preformatted( err.stack ),
					mrkdwn_in: [ "title", "text" ]
				} ]
			} );
		}
	}
};

module.exports = api;
