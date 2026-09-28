import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT id, email, role, first_name, last_name, is_active, last_login, created_at
     FROM users WHERE org_id = $1 ORDER BY created_at DESC`,
    [req.user!.org_id]
  );
  res.json({ users: result.rows });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT id, org_id, email, role, first_name, last_name, is_active, mfa_secret, last_login, created_at
     FROM users WHERE id = $1`,
    [req.user!.id]
  );
  res.json({ user: result.rows[0] });
});

// REAL VULN: IDOR — no org_id check, can read any user's profile
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT id, org_id, email, role, first_name, last_name, is_active, mfa_secret, last_login, created_at
     FROM users WHERE id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: result.rows[0] });
});

// REAL VULN: Mass assignment — can set role, is_active, org_id via PATCH
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = req.params.id;

  // Only allow self-edit unless admin
  if (userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Cannot edit other users' });
    return;
  }

  const allowedFields = ['first_name', 'last_name', 'email'];
  // REAL VULN: These dangerous fields are also accepted (privilege escalation)
  const dangerousFields = ['role', 'is_active', 'org_id'];
  const allFields = [...allowedFields, ...dangerousFields];

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 0;

  for (const field of allFields) {
    if (req.body[field] !== undefined) {
      paramCount++;
      updates.push(`${field} = $${paramCount}`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  if (req.body.password) {
    paramCount++;
    updates.push(`password_hash = $${paramCount}`);
    values.push(await bcrypt.hash(req.body.password, 10));
  }

  paramCount++;
  values.push(userId);

  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
     RETURNING id, org_id, email, role, first_name, last_name, is_active`,
    values
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: result.rows[0] });
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  const result = await pool.query(
    `UPDATE users SET is_active = false WHERE id = $1 AND org_id = $2 RETURNING id`,
    [req.params.id, req.user!.org_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ message: 'User deactivated' });
});

export default router;
