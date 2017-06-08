function encode( state, key, value ) {
	return JSON.stringify( { id: state.id, key, value } );
}

const preformatted = val => `\`\`\`\n${ val }\n\`\`\``;

module.exports = {
	bumpVersion( state ) {
		const val = v => encode( state, "versionBump", v );
		return {
			id: "versionBump",
			message: {
				text: "Creating release.  Please answer a few questions:",
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
	confirmRelease( state ) {
		const val = v => encode( state, "confirmRelease", v );
		return {
			id: "confirmRelease",
			message: {
				attachments: [ {
					pretext: "Is this what you want to release?",
					title: state.release.name,
					footer: `<@${ state.author.id }> as ${ state.user.github.name }`,
					footer_icon: state.author.profile.image_48,
					mrkdwn_in: [ "pretext", "fields" ],
					fields: [
						{ value: preformatted( state.release.notes ) },
						{ title: "Platform", value: state.release.platforms, short: true },
						{ title: "Version", value: state.release.version, short: true }
					],
					callback_id: "tag-release",
					actions: [
						{ name: "confirm_release", text: "Confirm", type: "button", style: "primary", value: val( "confirm" ) },
						{ name: "cancel", text: "Cancel", type: "button", value: val( "cancel" ) }
					]
				} ]
			}
		};
	},
	released( state ) {
		return {
			message: {
				text: "",
				attachments: [ {
					color: "#93c540",
					title: `${ state.release.name }`,
					title_link: state.release.url,
					footer: `<@${ state.author.id }> as ${ state.user.github.name }`,
					footer_icon: state.author.profile.image_48,
					mrkdwn_in: [ "title", "fields" ],
					fields: [
						{ value: preformatted( state.release.notes ), short: false },
						{ title: "Platform", value: state.release.platforms, short: true },
						{ title: "Version", value: state.release.version, short: true }
					],
					ts: Math.round( Date.now() / 1000 )
				} ]
			}
		};
	}
};
