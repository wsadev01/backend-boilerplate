const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter(10, 'second', true);

module.exports = (_, res, next) => {
	limiter.removeTokens(1, (_, remainingRequests) => {
		if (remainingRequests < 0) {
			res.writeHead(429, { 'Content-Type': 'text/plain;charset=UTF-8' });
			res.end('You are being rate limited buddy');
		}

		return next();
	});
}
