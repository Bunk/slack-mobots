const stepsFactory = require( "./steps" );
const questions = require( "./questions" );

module.exports = ( app ) => {
	const steps = stepsFactory( app );

	return {
		checkAccess: ( context ) => [
			steps.chat( context ).fetchAuthor,
			steps.github( context ).validateAccess,
			steps.github( context ).getLatestVersion,
			function hasAccess( state ) {
				state.answers.checkAccess = true;
			}
		],
		gatherVersionBump: ( context ) => [
			steps.chat( context ).ask( questions.bumpVersion )
			// steps.slack( msg ).ask( "gatherVersionBump", questions.confirmVersionBump )
		],
		confirmRelease: ( context ) => [
			steps.bumpVersion,
			steps.createRelease,
			steps.chat( context ).ask( questions.confirmRelease )
		],
		release: ( context ) => [
			steps.github( context ).release,
			steps.deleteState,
			steps.chat( context ).say( questions.released, { deleteOriginal: true } )
		],
		cancelled: ( context ) => [
			steps.deleteState,
			steps.chat( context ).say( null, { deleteOriginal: true } )
		]
	};
};
