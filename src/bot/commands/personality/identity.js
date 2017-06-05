const _ = require( "lodash" );
const util = require( "util" );

const greetings = [ "Oh, hai%s!", "Yes%s?", "What can I do for you%s?", "Hello%s.", "Hi%s." ];

module.exports = ( { config, log, controller, tryto } ) => {
	controller.hears(
		[ "hello", "^hi$", "howdy", "^yo$", "hola", "bonjour" ],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const greeting = greetings[ _.random( greetings.length - 1 ) ];
			const greet = name => bot.reply( message, util.format( greeting, `, ${ name }` ) );

			const updateUser = async ( user, convo ) => {
				await controller.storage.users.save( user );
				convo.say( `Got it.  I'll call you ${ user.name } from now on.` );
			};

			// Do I know you already?
			const foundUser = await controller.storage.users.get( message.user ).catch( err => null );
			const botUser = foundUser || { id: message.user };
			if ( botUser.name ) {
				return greet( botUser.name );
			}

			// Nope, let's get your name
			const slackUser = ( await bot.api.users.info( { user: message.user } ) || {} ).user;
			return bot.startConversationInThread( message, ( err, convo ) => {
				// Add this question to a separate 'personal_name' thread in case
				// we want to get personal
				convo.addQuestion( "Ok, what should I call you?",
					tryto.handleQuestion( async ( res, convo ) => {
						await updateUser( Object.assign( botUser, { name: res.text } ), convo );
						convo.next();
					} ), {}, "personal_name" );

				convo.ask( `We haven't met—should I call you ${ slackUser.name }?`, [ {
					pattern: bot.utterances.yes,
					callback: tryto.handleQuestion( async ( res, convo ) => {
						await updateUser( Object.assign( botUser, { name: res.user.name } ) );
						convo.next();
					} )
				}, {
					pattern: bot.utterances.no,
					callback: ( res, convo ) => {
						convo.gotoThread( "personal_name" );
						convo.next();
					}
				} ] );
			} );
		} );

	controller.hears(
		[ "call me (.*)", "my name is (.*)" ],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const name = message.match[ 1 ];
			const user = ( await controller.storage.users.get( message.user ) ) || { id: message.user };

			await controller.storage.users.save( Object.assign( user, { name } ) );

			bot.reply( message, `Got it. I will call you ${ name } from now on.` );
		} );
};
