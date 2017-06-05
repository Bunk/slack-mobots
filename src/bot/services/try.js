function blockTemplate( val ) {
	return val ? `\`\`\`\n${ val }\n\`\`\`` : "";
}

module.exports = ( { log } ) => {
	const api = {
		promisify( fn ) {
			return new Promise( ( resolve, reject ) => {
				try {
					const result = fn();
					return resolve( result );
				} catch ( err ) {
					return reject( err );
				}
			} );
		},
		handleQuestion( fn ) {
			return ( response, convo ) => api
				.promisify( () => fn( response, convo ) )
				.catch( err => {
					log.error( err, "Unable to handle the conversation" );
					convo.say( {
						attachments: [ {
							pretext: "I'm having some trouble with that request:",
							fallback: "I'm having some trouble with that request",
							color: "danger",
							text: blockTemplate( err.message ),
							mrkdwn_in: [ "text" ],
							ts: Math.round( Date.now() / 1000 )
						} ]
					} );
					convo.next();
				} );
		}
	};
	return api;
};
