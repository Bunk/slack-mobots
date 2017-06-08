module.exports = {
	slack: {
		blockTemplate: ( val ) => `\`\`\`\n${ val }\n\`\`\``,
		gitAttachment( opt ) {
			return {
				...opt,
				footer: "git",
				footer_icon: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
				ts: Math.round( Date.now() / 1000 )
			};
		},
		onError: ( ctx ) => ( err ) => {
			const body = `:sweat: Woops!  \`${ err.message }\`\n\`\`\`${ err.stack }\`\`\``;
			ctx.respond( body );
		}
	}
};
