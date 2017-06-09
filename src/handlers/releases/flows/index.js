const stepsFactory = require( "./steps" );
const questionsFactory = require( "./questions" );

module.exports = ( app ) => {
	const steps = stepsFactory( app );
	const questions = questionsFactory( app );

	return {
		checkAccess: ( context ) => [
			steps.chat( context ).fetchAuthor,
			steps.github( context ).validateAccess,
			function hasAccess( state ) {
				state.answers.checkAccess = true;
			}
		],
		gatherVersionBump: ( context ) => [
			steps.chat( context ).ask( questions.bumpVersion )
		],
		gatherBranch: ( context ) => [
			steps.github( context ).getAvailableBranches,
			steps.chat( context ).ask( questions.selectBranch )
		],
		confirmRelease: ( context ) => [
			steps.github( context ).getLatestVersion,
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
