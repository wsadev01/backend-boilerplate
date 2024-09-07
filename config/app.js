const appconfig = {
	db: {
		main: {
			name: process.env.DB_NAME,
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			ssl: process.env.DB_SSL ? process.env.DB_SSL === 'true' : undefined,
			mongostring: "",
		},
		default: {
			username: process.env.ROOT_USERNAME,
			password: process.env.ROOT_PASSWORD,
		}
	},
	session: {
		main: {
			secret: process.env.JWT_SECRET
		},
	},
	name: process.env.APP_NAME,
	port: process.env.WEBSERVER_PORT,
};
appconfig.db.main.mongostring = `mongodb://${appconfig.db.main.host}:${appconfig.db.main.port}/${appconfig.db.main.name}`

module.exports = appconfig
