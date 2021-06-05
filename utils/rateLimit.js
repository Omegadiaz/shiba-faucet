import rateLimit from 'express-rate-limit';
import initMiddleware from './initMiddleware';

export default initMiddleware(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    skip: req => req.method === 'OPTIONS',
    handler: function (req, res) {
      return res.status(429).json({ 
        message: "Too many requests from this IP, please try again after 10 minutes",
      });
    },
  })
)