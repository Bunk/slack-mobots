const engineFactory = require( "./engine" );
const flowFactory = require( "./flows" );

const questions = [
	{ flow: "gatherVersionBump", key: "versionBump" },
	{ flow: "confirmRelease", key: "confirmRelease" }
];

module.exports = ( app ) => {
	const { storage } = app;
	const engine = engineFactory( app );
	const flows = flowFactory( app );

	function resume( state ) {
		function executeAndSave( flow ) {
			flow.push( function storeState( value ) {  // eslint-disable-line prefer-arrow-callback
				storage.set( value.id, value );
			} );
			return engine.execute( state, flow );
		}

		return async ( context ) => {
			state.answers = state.answers || {};

			if ( state.cancelled ) {
				return executeAndSave( flows.cancelled( context ) );
			}

			if ( !state.answers.checkAccess ) {
				await executeAndSave( flows.checkAccess( context ) );
			}

			const next = questions.find( q => !state.answers[ q.key ] );
			if ( next ) {
				return executeAndSave( flows[ next.flow ]( context ) );
			}

			return executeAndSave( flows.release( context ) );
		};
	}

	function api( state ) {
		return {
			start( context ) {
				return resume( state )( context );
			},
			answer( context, { key, value } ) {
				state.answers[ key ] = value;
				return resume( state )( context );
			},
			cancel( context ) {
				state.cancelled = true;
				return resume( state )( context );
			}
		};
	}

	return {
		async lookupOrCreate( id, createFn ) {
			let state = await storage.get( id );
			if ( !state ) {
				if ( !createFn ) {
					throw new Error( "Could not find state for this release.  Please try again." );
				}
				state = createFn();
			}
			return api( state );
		}
	};
};
