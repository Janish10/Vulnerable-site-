import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT s.*, u.email as initiated_by_email
     FROM scans s
     LEFT JOIN users u ON s.initiated_by = u.id
     WHERE s.org_id = $1
     ORDER BY s.created_at DESC`,
    [req.user!.org_id]
  );
  res.json({ scans: result.rows });
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const [scanResult, findingsResult] = await Promise.all([
    pool.query(
      `SELECT s.*, u.email as initiated_by_email
       FROM scans s LEFT JOIN users u ON s.initiated_by = u.id
       WHERE s.id = $1 AND s.org_id = $2`,
      [req.params.id, req.user!.org_id]
    ),
    pool.query(
      `SELECT f.id, f.title, f.severity, f.status, f.finding_type
       FROM findings f WHERE f.scan_id = $1 AND f.org_id = $2
       ORDER BY f.severity DESC`,
      [req.params.id, req.user!.org_id]
    ),
  ]);

  if (scanResult.rows.length === 0) {
    res.status(404).json({ error: 'Scan not found' });
    return;
  }

  res.json({ scan: scanResult.rows[0], findings: findingsResult.rows });
});

router.post('/', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const { scan_type, target_assets, config: scanConfig } = req.body;

  if (!scan_type) {
    res.status(400).json({ error: 'scan_type required' });
    return;
  }

  const validTypes = ['full', 'fingerprint', 'vuln', 'port'];
  if (!validTypes.includes(scan_type)) {
    res.status(400).json({ error: 'Invalid scan_type', valid: validTypes });
    return;
  }

  const result = await pool.query(
    `INSERT INTO scans (org_id, initiated_by, scan_type, target_assets, config, status, started_at)
     VALUES ($1, $2, $3, $4, $5, 'running', now())
     RETURNING *`,
    [
      req.user!.org_id,
      req.user!.id,
      scan_type,
      target_assets || [],
      scanConfig || {},
    ]
  );

  // Simulate scan completion after creation (mock)
  setTimeout(async () => {
    await pool.query(
      "UPDATE scans SET status = 'completed', completed_at = now() WHERE id = $1",
      [result.rows[0].id]
    );
  }, 5000);

  res.status(201).json({ scan: result.rows[0] });
});

router.patch('/:id/cancel', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const result = await pool.query(
    `UPDATE scans SET status = 'failed', completed_at = now()
     WHERE id = $1 AND org_id = $2 AND status = 'running'
     RETURNING *`,
    [req.params.id, req.user!.org_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Running scan not found' });
    return;
  }

  res.json({ scan: result.rows[0] });
});

export default router;
