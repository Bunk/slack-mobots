/* eslint-disable no-template-curly-in-string */
// TODO: Support for other types of storage
const storage = {
	dir: process.env.STORAGE_DIR || ".db"
};

module.exports = {
	storage,
	web: {
		port: process.env.PORT || 8000
	},
	log: {
		level: process.env.LOG_LEVEL || "info"
	},
	github: {
		token: process.env.GITHUB_TOKEN || "",
		repositories: {
			upstream: {
				name: "leankit-mobile",
				uri: process.env.GITHUB_REPOSITORIES_UPSTREAM_URI || "https://${ token }@github.com/${ user }/${ name }.git",
				user: process.env.GITHUB_REPOSITORIES_UPSTREAM_USER || "BanditSoftware",
				token: process.env.GITHUB_REPOSITORIES_UPSTREAM_TOKEN || ""
			}
		}
	},
	hockey: {
		token: process.env.HOCKEY_TOKEN || ""
	},
	slack: {
		verifyToken: process.env.SLACK_VERIFY_TOKEN || ""
	}
};
