module.exports = ( { controller } ) => {
	controller.hears( [ "shutdown" ], "direct_message,direct_mention,mention", ( bot, message ) => {
		bot.startConversationInThread( message, ( err, convo ) => {
			convo.ask( "Are you sure you want me to shutdown?", [ {
				pattern: bot.utterances.yes,
				callback( response, shutdownConvo ) {
					shutdownConvo.say( "Bye!" );
					shutdownConvo.next();
					shutdownConvo.say( "Just kidding ;)" );
				}
			},
			{
				pattern: bot.utterances.no,
				default: true,
				callback( response, shutdownConvo ) {
					shutdownConvo.say( "*Phew!*" );
					shutdownConvo.next();
				}
			} ] );
		} );
	} );
};
