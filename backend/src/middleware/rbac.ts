import { Request, Response, NextFunction } from 'express';

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 40,
  admin: 30,
  analyst: 20,
  viewer: 10,
};

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minRequired = Math.min(...roles.map((r) => ROLE_HIERARCHY[r] || 0));

    if (userLevel < minRequired) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
