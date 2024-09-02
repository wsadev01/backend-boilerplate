require('dotenv').config({override: true});


const { check } = require('express-validator');
const appconf = require('../config/app')

function checkProperties(obj, path = '', count = { undefinedCount: 0 }) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively check nested objects
            checkProperties(obj[key], `${path}${key}.`, count);
        } else {
            if (obj[key] === undefined) {
                console.error(`\x1b[93m[!] Property ${path}${key} is undefined\x1b[0m`);
                count.undefinedCount += 1;
            } else {
				if (process.env.VERBOSE_CHECKUP === 'true') {
				    console.log(`Property \x1b[94m${path}${key}\x1b[0m is defined as \x1b[92m${obj[key]}\x1b[0m`);
				}
            }
        }
    }
    return count.undefinedCount;
}

const checkCustomEnv = (envKeyList) => {
    const auxObj = {};
    for (const key of envKeyList) {
        auxObj[`${key}`] = process.env[key]
    }
    return checkProperties(auxObj);
}

exports.checkCustomEnv = checkCustomEnv;
exports.checkProperties = checkProperties;

console.log("\n\x1b[96m.: Checking environment configuration :.\x1b[0m")

const failedChecks = {};

const appconfPropCount = checkProperties(appconf);

const envVariablesKeylist = [
    "EDBCREATE", // controllers/<crud>.js
    "EDBREAD", // -- (Same as above)
    "EDBUPDATE", // --
    "EDBDELETE", // --
    "EUNAUTH", // middlewares/auth.js
    "EFORBIDDEN",// --
    "EJWT", // --
    "JS_ERROR", // General javascript error code, literally 1 lol
    "DIR_LOG_ERROR", // server.js used for the error log path.
    "FILE_LOG_ERROR", // server.js used for the error log path.
    "JWT_SECRET", //config/passport/local.js obvious reasons.
]

const envMissingCount = checkCustomEnv(envVariablesKeylist);

if (appconfPropCount === 0) {
	console.log(`\x1b[92m[**] \x1b[0mApp. configuration passed`)
} else {
	failedChecks["App."] = appconfPropCount
}

if (envMissingCount === 0) {
    console.log("\x1b[92m[**] \x1b[0mEnv. configuration passed")
} else {
    failedChecks["Env."] = envMissingCount
}
for (const key of Object.keys(failedChecks)) {
	const value = failedChecks[key];
	console.log(`.: ${key} configuration is missing (\x1b[4m\x1b[1m${value}\x1b[0m) \x1b[4m\x1b[1menvironment\x1b[0m \x1b[4m\x1b[1mvariable(s)\x1b[0m :.`);
}

if (Object.keys(failedChecks).length >= 1 && process.env.STRICT_MODE === 'true') {
	console.log(".: Exiting... :.")
	process.exit(1)
}
