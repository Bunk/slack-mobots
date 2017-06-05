/* eslint-disable global-require */
const aupair = require( "aupair" );
const humanize = require( "humanize-duration" );

// Initialize our checkers
const dependencies = [
	require( "./github" ),
	require( "./hockeyapp" )
];

const colors = {
	degraded: "#fced00",
	healthy: "#c8cb32",
	unhealthy: "#d96f2a"
};

module.exports = ( app ) => {
	const { config, pkg, slapp } = app;

	dependencies.forEach( dependency => dependency( app ) );

	slapp.message( /(status|uptime)(\?)?$/i, [ "direct_message,direct_mention,mention" ], msg => {
		const hostname = config.identity;
		const uptime = humanize( process.uptime() * 1000 ); // eslint-disable-line no-magic-numbers
		aupair.check().then( status => {
			msg.say( {
				text: `v${ pkg.version } — ${ transformState( status ) }`,
				fallback: `v${ pkg.version } Status: ${ transformState( status ) }`,
				attachments: [ {
					mrkdwn_in: [ "text" ], // eslint-disable-line camelcase
					color: transformColor( status ),
					fields: [
						...transformDetails( status ),
						{ title: "Uptime", value: uptime, short: true },
						{ title: "Host", value: hostname, short: true }
					]
				} ]
			} );
		} );
	} );
};

function transformColor( status ) {
	if ( status.degraded ) {
		return colors.degraded;
	}
	return status.healthy ? colors.healthy : colors.unhealthy;
}

function transformState( status ) {
	if ( status.degraded ) {
		return "degraded";
	}
	return status.healthy ? "ok" : "down";
}

function transformStateIcon( status ) {
	if ( status.degraded ) {
		return ":poopfire:";
	}
	return status.healthy ? ":thumbsup:" : ":thumbsdown:";
}

function transformDetails( status ) {
	return status.details.map( detail => {
		return {
			title: detail.name,
			value: `${ transformStateIcon( detail ) } ${ detail.message }`,
			short: true
		};
	} );
}
