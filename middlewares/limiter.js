const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter(10, 'second', true);

module.exports = (req, res, next) => {
	console.log("RA")
  limiter.removeTokens(1, (err, remainingRequests) => {
		console.log("RB")
    if (err) {
			console.log("RC")
      return next(err); // Pass the error to the global error handler
    }

    if (remainingRequests < 0) {
			console.log("RD")
      res.status(429).send('You are being rate limited, buddy');
    } else {
      return next(); // Continue to the next middleware or route handler
    }
  });
	return next();
};
