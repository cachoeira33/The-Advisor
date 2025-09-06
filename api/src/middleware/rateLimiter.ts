import { RateLimiterMemory, IRateLimiterOptions } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

const rateLimiterOptions: IRateLimiterOptions = {
  points: 100,
  duration: 60,
};

const authRateLimiterOptions: IRateLimiterOptions = {
  points: 5,
  duration: 60 * 15,
};

const rateLimiter = new RateLimiterMemory(rateLimiterOptions);
const authRateLimiter = new RateLimiterMemory(authRateLimiterOptions);

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'anonymous';
  rateLimiter
    .consume(key)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    });
};

export const authRateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'anonymous';
  authRateLimiter
    .consume(key)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ error: 'Too many authentication attempts, please try again later.' });
    });
};