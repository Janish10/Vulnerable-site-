import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const { status, asset_type, sanctioned, search, page = '1', limit = '50' } = req.query;
  const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

  let query = 'SELECT * FROM assets WHERE org_id = $1';
  const params: unknown[] = [req.user!.org_id];
  let paramIdx = 1;

  if (status) {
    paramIdx++;
    query += ` AND status = $${paramIdx}`;
    params.push(status);
  }
  if (asset_type) {
    paramIdx++;
    query += ` AND asset_type = $${paramIdx}`;
    params.push(asset_type);
  }
  if (sanctioned !== undefined) {
    paramIdx++;
    query += ` AND is_sanctioned = $${paramIdx}`;
    params.push(sanctioned === 'true');
  }
  if (search) {
    paramIdx++;
    query += ` AND (hostname ILIKE $${paramIdx} OR ip_address::text ILIKE $${paramIdx})`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit as string, 10)} OFFSET ${offset}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query('SELECT COUNT(*) FROM assets WHERE org_id = $1', [req.user!.org_id]),
  ]);

  res.json({
    assets: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  });
});

// REAL VULN: IDOR — missing org_id check, can read any org's asset
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  res.json({ asset: result.rows[0] });
});

router.get('/:id/technologies', authenticate, async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT t.* FROM technologies t
     JOIN assets a ON t.asset_id = a.id
     WHERE t.asset_id = $1 AND a.org_id = $2
     ORDER BY t.confidence DESC, t.created_at DESC`,
    [req.params.id, req.user!.org_id]
  );
  res.json({ technologies: result.rows });
});

router.post('/', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const { hostname, ip_address, port, protocol, asset_type, is_sanctioned, tags, metadata } =
    req.body;

  if (!hostname) {
    res.status(400).json({ error: 'Hostname required' });
    return;
  }

  const result = await pool.query(
    `INSERT INTO assets (org_id, hostname, ip_address, port, protocol, asset_type, is_sanctioned, tags, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      req.user!.org_id,
      hostname,
      ip_address || null,
      port || 443,
      protocol || 'https',
      asset_type || 'web',
      is_sanctioned !== false,
      tags || [],
      metadata || {},
    ]
  );

  res.status(201).json({ asset: result.rows[0] });
});

// REAL VULN: SSRF — accepts a URL and fetches it server-side
router.post('/import', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const { url, csv_data } = req.body;

  if (url) {
    try {
      const http = await import('http');
      const https = await import('https');
      const mod = url.startsWith('https') ? https : http;

      const fetchPromise = new Promise<string>((resolve, reject) => {
        mod.get(url, (resp: any) => {
          let data = '';
          resp.on('data', (chunk: string) => (data += chunk));
          resp.on('end', () => resolve(data));
          resp.on('error', reject);
        });
      });

      const data = await fetchPromise;
      res.json({ message: 'Import started', preview: data.substring(0, 500) });
      return;
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to fetch URL', details: err.message });
      return;
    }
  }

  if (csv_data) {
    res.json({ message: 'CSV import not yet implemented', rows_received: csv_data.length });
    return;
  }

  res.status(400).json({ error: 'Provide url or csv_data' });
});

router.patch('/:id', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const fields = ['hostname', 'ip_address', 'port', 'protocol', 'asset_type', 'status', 'is_sanctioned', 'tags', 'metadata'];
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 0;

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      paramIdx++;
      updates.push(`${field} = $${paramIdx}`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  paramIdx++;
  values.push(req.params.id);
  paramIdx++;
  values.push(req.user!.org_id);

  const result = await pool.query(
    `UPDATE assets SET ${updates.join(', ')}, updated_at = now()
     WHERE id = $${paramIdx - 1} AND org_id = $${paramIdx}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  res.json({ asset: result.rows[0] });
});

router.delete('/:id', authenticate, requireRole('analyst'), async (req: Request, res: Response) => {
  const result = await pool.query(
    'DELETE FROM assets WHERE id = $1 AND org_id = $2 RETURNING id',
    [req.params.id, req.user!.org_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  res.json({ message: 'Asset deleted' });
});

export default router;
