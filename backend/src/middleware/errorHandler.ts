import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[${req.method} ${req.path}]`, err.message);

  // REAL VULN: Stack traces leak in non-production mode
  // The docker env sets NODE_ENV=production, but this is overridable
  const isDev = config.nodeEnv !== 'production';

  res.status(500).json({
    error: 'Internal server error',
    message: isDev ? err.message : undefined,
    stack: isDev ? err.stack : undefined,
    path: req.path,
  });
}
