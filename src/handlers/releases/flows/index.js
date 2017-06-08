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
			// steps.files.updatePackageVersion,
			// steps.files.updateChangeLog,
			// steps.github( msg ).stageFile( state => state.filePaths.package ),
			// steps.github( msg ).stageFile( state => state.filePaths.changeLog ),
			// steps.github( msg ).branchFrom( state => `heads/${ state.branches.head }` ),
			// steps.github( msg ).commitStaged,
			// steps.github( msg ).openPullRequest( state => state.branches.current ),
			// steps.github( msg ).mergePullRequest( "merge" ),
			// steps.github( msg ).mergeFastForward( state => state.branches.base ),
			// steps.github( msg ).tagVersion,
			// steps.github( msg ).createRelease,
			// steps.github( msg ).deleteBranch( state => state.branches.current ),
			steps.deleteState,
			steps.chat( context ).say( questions.released, { deleteOriginal: true } )
		],
		cancelled: ( context ) => [
			steps.deleteState,
			steps.chat( context ).say( null, { deleteOriginal: true } )
		]
	};
};
