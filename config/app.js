exports = {
	db: {
		main: {
			name: process.env.DB_NAME,
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			ssl: process.env.DB_SSL ? true : false,
		}
	},
	name: process.env.APP_NAME,
	port: process.env.WEBSERVER_PORT,
};


