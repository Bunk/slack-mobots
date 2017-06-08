/* eslint-disable global-require */
module.exports = app => {
	return {
		init() {
			const modules = [
				require( "./status" ),
				require( "./releases" )
				// require( "./releases/pipelines/fsm2" )
				// require( "./releases" )
			];
			modules.forEach( module => module( app ) );
		}
	};
};
