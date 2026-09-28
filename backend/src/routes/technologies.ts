import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const { confidence, name, asset_id } = req.query;

  let query = `
    SELECT t.*, a.hostname as asset_hostname
    FROM technologies t
    JOIN assets a ON t.asset_id = a.id
    WHERE a.org_id = $1`;
  const params: unknown[] = [req.user!.org_id];
  let paramIdx = 1;

  if (confidence) {
    paramIdx++;
    query += ` AND t.confidence = $${paramIdx}`;
    params.push(confidence);
  }
  if (name) {
    paramIdx++;
    query += ` AND t.name ILIKE $${paramIdx}`;
    params.push(`%${name}%`);
  }
  if (asset_id) {
    paramIdx++;
    query += ` AND t.asset_id = $${paramIdx}`;
    params.push(asset_id);
  }

  query += ' ORDER BY t.confidence DESC, t.name ASC';

  const result = await pool.query(query, params);
  res.json({ technologies: result.rows });
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const techResult = await pool.query(
    `SELECT t.*, a.hostname as asset_hostname
     FROM technologies t
     JOIN assets a ON t.asset_id = a.id
     WHERE t.id = $1 AND a.org_id = $2`,
    [req.params.id, req.user!.org_id]
  );

  if (techResult.rows.length === 0) {
    res.status(404).json({ error: 'Technology not found' });
    return;
  }

  const cveResult = await pool.query(
    `SELECT cm.*, c.description, c.cvss_v3_score, c.is_kev
     FROM cve_matches cm
     JOIN cves c ON cm.cve_id = c.id
     WHERE cm.technology_id = $1
     ORDER BY c.cvss_v3_score DESC NULLS LAST`,
    [req.params.id]
  );

  res.json({
    technology: techResult.rows[0],
    cve_matches: cveResult.rows,
  });
});

export default router;
