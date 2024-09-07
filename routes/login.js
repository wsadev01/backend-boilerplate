const {
  login,
  logout,
} = require("../controllers/auth");

const rateLimiter  = require("../middlewares/limiter");

module.exports = (application) => {
  application
    .route("/api/login")
    .post(rateLimiter, login);
	application
    .route("/api/logout")
    .post(rateLimiter,  logout);
};
