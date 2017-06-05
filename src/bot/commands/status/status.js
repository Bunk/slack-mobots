const aupair = require( "aupair" );
const humanize = require( "humanize-duration" );

const colors = {
	degraded: "#fced00",
	healthy: "#c8cb32",
	unhealthy: "#d96f2a"
};

module.exports = ( { config, log, pkg, controller } ) => {
	controller.hears(
		[ /(status|uptime)(\?)?$/i ],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const hostname = config.identity;
			const uptime = humanize( process.uptime() * 1000 ); // eslint-disable-line no-magic-numbers
			const status = await aupair.check();
			bot.reply( message, {
				fallback: `${ bot.identity.name } v${ pkg.version } ${ transformState( status ) }`,
				attachments: [ {
					mrkdwn_in: [ "text" ], // eslint-disable-line camelcase
					color: transformColor( status ),
					title: `${ bot.identity.name } v${ pkg.version }`,
					fallback: `${ bot.identity.name } v${ pkg.version } Status: ${ transformState( status ) }`,
					text: transformMessage( status ),
					fields: [
						...transformDetails( status ),
						{ title: "Uptime", value: uptime, short: true },
						{ title: "Host", value: hostname, short: true }
					]
				} ]
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

function transformMessage( status ) {
	if ( status.degraded ) {
		return "Here, hold my beer... :beer:";
	}
	return status.healthy ? "I'm killin' it today! :partyparrot:" : "Life and everything is *hard* :sadpanda:";
}
