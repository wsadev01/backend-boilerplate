// Modules
const passport = require("passport");
const jwt = require('jsonwebtoken')

exports.login = (req, res, next) => {
  passport.authenticate("local-login", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {

      return res.failure(-1, "Wrong username or password", 422);
    }
    req.logIn(user, (err) => {
      if (err) {

        return next(err);
      }
      user.password = "";
			const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.success({ user, token }, 200);
    });
  })(req, res, next);
};
exports.logout = (req, res) => {
	console.log("A")
	req.logout();
	return res.success({}, 200);
};
