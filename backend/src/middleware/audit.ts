import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool';

export function auditLog(req: Request, res: Response, next: NextFunction): void {
  const originalSend = res.send;

  res.send = function (body) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const details: Record<string, unknown> = {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        query: req.query,
      };

      // REAL VULN: API key from query string is logged in audit details
      if (req.query.api_key) {
        details.api_key = req.query.api_key;
      }

      pool
        .query(
          `INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.user?.org_id || null,
            req.user?.id || null,
            `${req.method} ${req.path}`,
            req.path.split('/')[2] || 'unknown',
            null,
            JSON.stringify(details),
            req.ip,
            req.headers['user-agent'] || null,
          ]
        )
        .catch(() => {});
    }

    return originalSend.call(this, body);
  };

  next();
}
