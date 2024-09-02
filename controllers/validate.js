const { validationResult } = require('express-validator');

exports.validateController = async (req, res, next) => {
  const result = validationResult(req);
	if (!result.isEmpty()) {
		console.error("[!] express-validator result is not empty\n\n[!] Errors:");
		console.error(result.array())
		return res.failure(
			{ errors: validationResult.array() },
			400,
			-3
		);
	} else {
		next()
	}
}

