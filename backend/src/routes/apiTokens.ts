import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT id, name, token_prefix, scopes, last_used, expires_at, created_at
     FROM api_tokens
     WHERE user_id = $1 AND org_id = $2
     ORDER BY created_at DESC`,
    [req.user!.id, req.user!.org_id]
  );
  res.json({ tokens: result.rows });
});

router.post('/', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const { name, scopes, expires_in_days } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Token name required' });
    return;
  }

  const rawToken = `slt_${uuidv4().replace(/-/g, '')}`;
  const prefix = rawToken.substring(0, 8);
  const hash = await bcrypt.hash(rawToken, 10);

  const expiresAt = expires_in_days
    ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const result = await pool.query(
    `INSERT INTO api_tokens (user_id, org_id, name, token_hash, token_prefix, scopes, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, token_prefix, scopes, expires_at, created_at`,
    [req.user!.id, req.user!.org_id, name, hash, prefix, scopes || [], expiresAt]
  );

  // REAL VULN: Full token returned in response (and gets logged by audit middleware)
  res.status(201).json({
    token: result.rows[0],
    raw_token: rawToken,
    warning: 'Store this token securely. It will not be shown again.',
  });
});

router.delete('/:id', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const result = await pool.query(
    'DELETE FROM api_tokens WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Token not found' });
    return;
  }

  res.json({ message: 'Token revoked' });
});

export default router;
