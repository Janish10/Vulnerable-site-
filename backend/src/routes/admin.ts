import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/audit-logs', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  const { page = '1', limit = '100' } = req.query;
  const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

  const result = await pool.query(
    `SELECT al.*, u.email as user_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.org_id = $1
     ORDER BY al.created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.user!.org_id, parseInt(limit as string, 10), offset]
  );

  res.json({ audit_logs: result.rows });
});

router.get('/stats', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  // REAL VULN: Debug SQL parameter — allows arbitrary SQL execution
  const { sql } = req.query;
  if (sql) {
    try {
      const result = await pool.query(sql as string);
      res.json({ debug: true, result: result.rows });
      return;
    } catch (err: any) {
      res.status(400).json({ debug: true, error: err.message });
      return;
    }
  }

  const [assets, findings, scans, users] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM assets WHERE org_id = $1', [req.user!.org_id]),
    pool.query(
      `SELECT severity, COUNT(*) FROM findings WHERE org_id = $1 GROUP BY severity`,
      [req.user!.org_id]
    ),
    pool.query(
      `SELECT status, COUNT(*) FROM scans WHERE org_id = $1 GROUP BY status`,
      [req.user!.org_id]
    ),
    pool.query('SELECT COUNT(*) FROM users WHERE org_id = $1', [req.user!.org_id]),
  ]);

  res.json({
    total_assets: parseInt(assets.rows[0].count, 10),
    findings_by_severity: findings.rows.reduce(
      (acc: Record<string, number>, r: { severity: string; count: string }) => {
        acc[r.severity] = parseInt(r.count, 10);
        return acc;
      },
      {}
    ),
    scans_by_status: scans.rows.reduce(
      (acc: Record<string, number>, r: { status: string; count: string }) => {
        acc[r.status] = parseInt(r.count, 10);
        return acc;
      },
      {}
    ),
    total_users: parseInt(users.rows[0].count, 10),
  });
});

export default router;
