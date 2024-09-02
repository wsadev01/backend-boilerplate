/* jshint esversion: 6 */

// require
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// cfg

// require models
require("../models/index")();

// Models
const Users = mongoose.model("User");

// App configuration
const appconf = require('../config/app');

// variables
mongoose.Promise = Promise;


// connect database
exports.mongo = async () => {
	const mongostring = appconf.db.main.mongostring;

	try {
		await mongoose.connect(mongostring);

		console.log("\x1b[92m[+] \x1b[0mConnected to MongoDB");
		console.log(`\x1b[92m[+] \x1b[0mDB: \x1b[94m\x1b[4m[${appconf.name}]\x1b[0m`);

		// Crea el usuario administrador de sistema
		const filter = { createdBy: "system" };
		const user = await Users.findOne(filter).exec();

		if (!user) {

			console.log("\x1b[91m[!] \x1b[0mNo default root user, creating...")
			const adminUser = {
				username: process.env.ROOT_USERNAME,
				password: bcrypt.hashSync(
					process.env.ROOT_PASSWORD,
					bcrypt.genSaltSync(10),
					null
				),
				createdBy: "system",
				rol: "root",
			};
			await new Users(adminUser).save();
			console.log("\x1b[92m[+] \x1b[0mRoot user created")
		} else if (!!user) {
			if (user.deleted === true) {
				user.deleted = false;
				await user.save();
			}
		}
	} catch (ex) {
		console.log(`\n[+] MongoDB exception ${ex}`);
		console.log("Reconnecting in 5 seconds...");
		return setTimeout(exports.mongo, 5000);
	}
};
