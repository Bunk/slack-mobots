const meld = require( "meld" );
module.exports = ( app ) => {
	const { log } = app;

	return {
		advise( obj ) {
			return meld( obj, {
				around( joinpoint ) {
					const { method } = joinpoint;
					log.debug( { method }, "Running flow step" );
					return joinpoint.proceed();
				}
			} );
		}
	};
};
