module.exports = ( app ) => {
	return ( context ) => {
		return {
			ask: ( questionFn ) => function ask( state, next ) {
				const question = questionFn( state );
				if ( !state.answers[ question.id ] ) {
					const { message } = question;
					return context.respond( message );
				}
				return Promise.resolve();
			},
			say: ( fn, { deleteOriginal = false } = {} ) => function say( state ) {
				if ( fn ) {
					const { message } = fn( state );
					context.say( message );
				}
				if ( deleteOriginal ) {
					context.respond( { delete_original: true } );
				}
			},
			respond: ( msgFn ) => function respond( state ) {
				return context.respond( msgFn( state ) );
			},
			async fetchAuthor( state ) {
				const response = await context.fetchUser();
				state.author = response.user;
			}
		};
	};
};
