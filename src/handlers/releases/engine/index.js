const _ = require( "lodash" );
const adviceFactory = require( "./advice" );

module.exports = ( app ) => {
	const { log } = app;
	const advice = adviceFactory( app );

	return {
		async execute( state, flows ) {
			log.debug( { flows: flows.map( f => ( f && f.name ) || undefined ) }, "Executing flows" );
			flows.forEach( flow => {
				if ( !flow || !_.isFunction( flow ) ) {
					throw new Error( "Attempt to execute a flow step that was not a function.  Flog the developer." );
				}
			} );

			// Add advice
			flows = flows.map( f => advice.advise( f ) );

			// Run all the flows
			await flows.reduce( ( promise, fn ) => promise.then( () => fn( state ) ), Promise.resolve() );

			return this;
		}
	};
};
