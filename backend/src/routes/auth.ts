import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { config } from '../config';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  // REAL VULN: Timing oracle — different response time for existing vs non-existing email
  const result = await pool.query(
    'SELECT id, org_id, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    res.status(401).json({ error: 'Account disabled' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  await pool.query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

  const accessToken = jwt.sign(
    { id: user.id, org_id: user.org_id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: false, // REAL VULN: should be true in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 900,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
    },
  });
});

// REAL VULN: No rate limiting, open registration to any org
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, first_name, last_name, org_id } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  // REAL VULN: Can register into any org by providing org_id
  const targetOrg = org_id || '00000000-0000-0000-0000-000000000001';

  try {
    const result = await pool.query(
      `INSERT INTO users (org_id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, 'viewer', $4, $5)
       RETURNING id, org_id, email, role`,
      [targetOrg, email, hash, first_name || null, last_name || null]
    );

    const user = result.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, org_id: user.org_id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    res.status(201).json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900,
      user: { id: user.id, email: user.email, role: user.role, org_id: user.org_id },
    });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    throw err;
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as { id: string; type: string };
    if (decoded.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }

    const result = await pool.query(
      'SELECT id, org_id, email, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, org_id: user.org_id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    res.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 900 });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authenticate, (_req: Request, res: Response) => {
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  res.json({ message: 'Logged out' });
});

export default router;
