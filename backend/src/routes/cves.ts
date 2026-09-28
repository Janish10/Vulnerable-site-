import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const { product, severity_min, is_kev, search, page = '1', limit = '50' } = req.query;
  const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

  let query = 'SELECT * FROM cves WHERE 1=1';
  const params: unknown[] = [];
  let paramIdx = 0;

  if (product) {
    paramIdx++;
    query += ` AND affected_product ILIKE $${paramIdx}`;
    params.push(`%${product}%`);
  }
  if (severity_min) {
    paramIdx++;
    query += ` AND cvss_v3_score >= $${paramIdx}`;
    params.push(parseFloat(severity_min as string));
  }
  if (is_kev === 'true') {
    query += ' AND is_kev = true';
  }
  if (search) {
    paramIdx++;
    query += ` AND (id ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY cvss_v3_score DESC NULLS LAST LIMIT ${parseInt(limit as string, 10)} OFFSET ${offset}`;

  const result = await pool.query(query, params);
  res.json({ cves: result.rows });
});

router.get('/lookup', authenticate, async (req: Request, res: Response) => {
  const { product, version } = req.query;

  if (!product) {
    res.status(400).json({ error: 'product parameter required' });
    return;
  }

  let query = `SELECT * FROM cves WHERE affected_product ILIKE $1`;
  const params: unknown[] = [`%${product}%`];

  if (version && version !== 'unknown') {
    query += ` AND (
      (affected_version_end IS NOT NULL AND $2 <= affected_version_end)
      OR affected_version_end IS NULL
    )`;
    params.push(version);
  }

  query += ' ORDER BY cvss_v3_score DESC NULLS LAST';

  const result = await pool.query(query, params);
  res.json({
    product,
    version: version || 'unknown',
    cves: result.rows,
    total: result.rows.length,
  });
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM cves WHERE id = $1', [req.params.id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'CVE not found' });
    return;
  }

  const matchesResult = await pool.query(
    `SELECT cm.*, t.name as tech_name, t.version as tech_version, a.hostname
     FROM cve_matches cm
     JOIN technologies t ON cm.technology_id = t.id
     JOIN assets a ON t.asset_id = a.id
     WHERE cm.cve_id = $1`,
    [req.params.id]
  );

  res.json({
    cve: result.rows[0],
    matches: matchesResult.rows,
  });
});

export default router;
