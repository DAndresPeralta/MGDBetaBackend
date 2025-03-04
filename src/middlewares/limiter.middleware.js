import rateLimiter from "express-rate-limit";

export const loginLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: "Too many requests",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});
