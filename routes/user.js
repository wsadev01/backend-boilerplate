const {
  create,
  read,
  update,
  remove,
} = require("../controllers/user");

const rateLimiter  = require("../middlewares/limiter");
const {isRoot, isAuth} = require("../middlewares/auth");

module.exports = (application) => {
  application
    .route("/api/users")
    .post(rateLimiter, isRoot, create)
    .get(rateLimiter, isAuth, read)
    .put(rateLimiter, isAuth, update)
    .delete(rateLimiter, isAuth, remove);
};
