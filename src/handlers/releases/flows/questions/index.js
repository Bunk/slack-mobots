module.exports = ( { utils: { slack } } ) => ( {
	bumpVersion( state ) {
		const val = v => slack.encode( state, "versionBump", v );
		return {
			id: "versionBump",
			message: {
				text: "",
				attachments: [ {
					text: "What type of release is this?",
					callback_id: "tag-release",
					actions: [
						{ name: "confirm_version_bump", text: "Major", type: "button", value: val( "major" ) },
						{ name: "confirm_version_bump", text: "Minor", type: "button", value: val( "minor" ) },
						{ name: "confirm_version_bump", text: "Patch", type: "button", value: val( "patch" ) }
					]
				} ]
			}
		};
	},
	selectBranch( state ) {
		const val = v => slack.encode( state, "selectedBranch", v );
		return {
			id: "selectedBranch",
			message: {
				text: "",
				attachments: [ slack.attachment.github( {
					text: "Which branch would you like to tag?",
					callback_id: "tag-release",
					actions: [ {
						name: "selected_branch",
						text: "Switch to branch...",
						color: "#3AA3E3",
						type: "select",
						options: state.branches.map( value => ( { text: value, value: val( value ) } ) )
					} ]
				} ) ]
			}
		};
	},
	confirmRelease( state ) {
		const val = v => slack.encode( state, "confirmRelease", v );
		const message = {
			text: "Is this what you want to release?",
			attachments: [ slack.attachment.github( {
				title: `${ state.release.name }`,
				footer: `<@${ state.author.id }> as ${ state.user.github.name }`,
				mrkdwn_in: [ "title", "text", "fields" ],
				fields: [
					{ value: slack.preformatted( state.release.notes ) },
					{ title: "Platform", value: state.release.platforms, short: true },
					{ title: "Version", value: state.release.version, short: true }
				],
				callback_id: "tag-release",
				actions: [
					{ name: "confirm_release", text: "Confirm", type: "button", style: "primary", value: val( "confirm" ) },
					{ name: "cancel", text: "Cancel", type: "button", value: val( "cancel" ) }
				]
			} ) ]
		};
		if ( state.release.target !== "develop" ) {
			message.attachments[ 0 ].text = `_on \`${ state.release.target }\`_`;
		}
		return { id: "confirmRelease", message };
	},
	released( state ) {
		const message = {
			text: "",
			attachments: [ slack.attachment.github( {
				color: "#93c540",
				title: `${ state.release.name }`,
				title_link: state.release.url,
				footer: `<@${ state.author.id }> as ${ state.user.github.name }`,
				mrkdwn_in: [ "title", "fields" ],
				fields: [
					{ value: slack.preformatted( state.release.notes ), short: false },
					{ title: "Platform", value: state.release.platforms, short: true },
					{ title: "Version", value: state.release.version, short: true }
				]
			} ) ]
		};
		if ( state.release.target !== "develop" ) {
			message.attachments[ 0 ].text = `_on \`${ state.release.target }\`_`;
		}
		return { message };
	}
} );
