import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM orgs WHERE id = $1', [req.user!.org_id]);
  res.json({ org: result.rows[0] });
});

router.patch('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  if (req.params.id !== req.user!.org_id) {
    res.status(403).json({ error: 'Cannot modify other organizations' });
    return;
  }

  const { name, plan } = req.body;
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 0;

  if (name) {
    paramIdx++;
    updates.push(`name = $${paramIdx}`);
    values.push(name);
  }
  if (plan) {
    paramIdx++;
    updates.push(`plan = $${paramIdx}`);
    values.push(plan);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  paramIdx++;
  values.push(req.params.id);

  const result = await pool.query(
    `UPDATE orgs SET ${updates.join(', ')}, updated_at = now() WHERE id = $${paramIdx} RETURNING *`,
    values
  );

  res.json({ org: result.rows[0] });
});

export default router;
