import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const { severity, status, category, asset_id, sort, page = '1', limit = '50' } = req.query;
  const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

  let query = 'SELECT f.*, a.hostname as asset_hostname FROM findings f LEFT JOIN assets a ON f.asset_id = a.id WHERE f.org_id = $1';
  const params: unknown[] = [req.user!.org_id];
  let paramIdx = 1;

  if (severity) {
    paramIdx++;
    query += ` AND f.severity = $${paramIdx}`;
    params.push(severity);
  }
  if (status) {
    paramIdx++;
    query += ` AND f.status = $${paramIdx}`;
    params.push(status);
  }
  if (category) {
    paramIdx++;
    query += ` AND f.category = $${paramIdx}`;
    params.push(category);
  }
  if (asset_id) {
    paramIdx++;
    query += ` AND f.asset_id = $${paramIdx}`;
    params.push(asset_id);
  }

  // REAL VULN: SQL injection in ORDER BY — raw string interpolation
  if (sort) {
    query += ` ORDER BY ${sort}`;
  } else {
    query += ' ORDER BY f.created_at DESC';
  }

  query += ` LIMIT ${parseInt(limit as string, 10)} OFFSET ${offset}`;

  const result = await pool.query(query, params);

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM findings WHERE org_id = $1',
    [req.user!.org_id]
  );

  res.json({
    findings: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  });
});

router.get('/export', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT f.title, f.severity, f.category, f.finding_type, f.status, f.evidence,
            f.remediation, f.cve_ids, f.cvss_score, f.created_at,
            a.hostname as asset_hostname
     FROM findings f
     LEFT JOIN assets a ON f.asset_id = a.id
     WHERE f.org_id = $1
     ORDER BY f.severity DESC, f.created_at DESC`,
    [req.user!.org_id]
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=findings-export.csv');

  const header = 'Title,Severity,Category,Type,Status,Asset,CVEs,CVSS,Created\n';
  const rows = result.rows
    .map(
      (r) =>
        `"${r.title}",${r.severity},${r.category},${r.finding_type},${r.status},"${r.asset_hostname}","${(r.cve_ids || []).join(';')}",${r.cvss_score || ''},${r.created_at}`
    )
    .join('\n');

  res.send(header + rows);
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT f.*, a.hostname as asset_hostname, t.name as tech_name, t.version as tech_version
     FROM findings f
     LEFT JOIN assets a ON f.asset_id = a.id
     LEFT JOIN technologies t ON f.technology_id = t.id
     WHERE f.id = $1 AND f.org_id = $2`,
    [req.params.id, req.user!.org_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Finding not found' });
    return;
  }

  res.json({ finding: result.rows[0] });
});

router.patch('/:id/status', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['open', 'confirmed', 'fp', 'resolved', 'accepted'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status', valid: validStatuses });
    return;
  }

  const updates: Record<string, unknown> = { status };
  if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  }

  const result = await pool.query(
    `UPDATE findings SET status = $1, resolved_at = $2, updated_at = now()
     WHERE id = $3 AND org_id = $4
     RETURNING *`,
    [status, updates.resolved_at || null, req.params.id, req.user!.org_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Finding not found' });
    return;
  }

  res.json({ finding: result.rows[0] });
});

// REAL VULN: Stored XSS — comment body is stored as-is, rendered unescaped in one frontend view
router.post('/:id/comment', authenticate, async (req: Request, res: Response) => {
  const { body } = req.body;

  if (!body) {
    res.status(400).json({ error: 'Comment body required' });
    return;
  }

  const findingResult = await pool.query(
    'SELECT id FROM findings WHERE id = $1 AND org_id = $2',
    [req.params.id, req.user!.org_id]
  );

  if (findingResult.rows.length === 0) {
    res.status(404).json({ error: 'Finding not found' });
    return;
  }

  // Store comment in the finding's evidence JSONB as an array
  const result = await pool.query(
    `UPDATE findings SET
       evidence = jsonb_set(
         COALESCE(evidence, '{}'::jsonb),
         '{comments}',
         COALESCE(evidence->'comments', '[]'::jsonb) || $1::jsonb
       ),
       updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [
      JSON.stringify({
        user_id: req.user!.id,
        user_email: req.user!.email,
        body: body, // REAL VULN: No sanitization
        created_at: new Date().toISOString(),
      }),
      req.params.id,
    ]
  );

  res.status(201).json({ finding: result.rows[0] });
});

export default router;
