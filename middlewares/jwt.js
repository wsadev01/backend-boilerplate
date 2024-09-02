const passport = require('passport');

module.exports = (req, res, next) => {
  passport.authenticate('jwt', (err, user, _) => {
    if (err)  return res.failure(process.env.EJWT, "Internal error", 500);
		else if (!user) return res.failure(process.env.EUNAUTH, 'Unauthorized', 401);

		// * logIn method added by passport.
    req.logIn(
			user,
			(err) => {
				if (err) {
					next(err)
				};
				next();
			}
		);
  })(req, res, next);
};
