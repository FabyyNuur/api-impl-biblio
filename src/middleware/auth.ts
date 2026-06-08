import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';
import { AuthTokenPayload, UserRole } from '../models/User';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès refusé' });
      return;
    }
    next();
  };
}

export function requireSelfOrRole(paramName: string, ...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const resourceId = req.params[paramName];
    if (req.user.id === resourceId || roles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ error: 'Accès refusé' });
  };
}
