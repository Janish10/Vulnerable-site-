import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { pool } from '../db/pool';

export interface AuthUser {
  id: string;
  org_id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // REAL VULN: API key in query string is accepted and logged
  const queryKey = req.query.api_key as string | undefined;

  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (queryKey) {
    token = queryKey;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Try JWT first
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    req.user = decoded;
    next();
    return;
  } catch {
    // Not a valid JWT, try API token
  }

  // Try API token lookup
  verifyApiToken(token)
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      req.user = user;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Authentication failed' });
    });
}

async function verifyApiToken(token: string): Promise<AuthUser | null> {
  const bcrypt = await import('bcrypt');
  const prefix = token.substring(0, 8);

  const result = await pool.query(
    `SELECT t.token_hash, t.org_id, t.scopes, u.id, u.email, u.role
     FROM api_tokens t JOIN users u ON t.user_id = u.id
     WHERE t.token_prefix = $1 AND t.expires_at > now()`,
    [prefix]
  );

  for (const row of result.rows) {
    const valid = await bcrypt.compare(token, row.token_hash);
    if (valid) {
      await pool.query(
        'UPDATE api_tokens SET last_used = now() WHERE token_prefix = $1',
        [prefix]
      );
      return {
        id: row.id,
        org_id: row.org_id,
        email: row.email,
        role: row.role,
      };
    }
  }
  return null;
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.slice(7);
    req.user = jwt.verify(token, config.jwt.secret) as AuthUser;
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
