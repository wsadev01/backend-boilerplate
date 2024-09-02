
exports.isAuth = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.failure(process.env.EUNAUTH, 'Unauthenticated', 401);
	}
	next();
};

exports.isRoot = (req, res, next) => {
	exports.isAuth(req, res, (err) => {
		if (err) next(err);

		if (req.user.rol !== 'root') {
			return res.failure(process.env.EFORBIDDEN, 'Forbidden', 403);
		}
		next();
	});
};
