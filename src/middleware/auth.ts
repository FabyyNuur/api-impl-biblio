import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';
import { database } from '../config/database';
import { AuthTokenPayload, UserRole } from '../models/User';

const PASSWORD_CHANGE_WHITELIST = ['/api/auth/change-password', '/api/auth/me'];

function isPasswordChangeWhitelisted(path: string): boolean {
  return PASSWORD_CHANGE_WHITELIST.some(
    (whitelistedPath) => path === whitelistedPath || path.startsWith(`${whitelistedPath}/`)
  );
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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
      role: payload.role,
    };

    const path = req.originalUrl.split('?')[0];
    if (isPasswordChangeWhitelisted(path)) {
      next();
      return;
    }

    const row = await database.get(
      'SELECT mustChangePassword FROM users WHERE id = ?',
      [req.user.id]
    );

    if (row?.mustChangePassword) {
      res.status(403).json({
        error: 'Vous devez changer votre mot de passe',
        mustChangePassword: true,
      });
      return;
    }

    next();
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide' });
  }
}

export function optionalAuthenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // Token invalide ou expiré : traiter comme requête non authentifiée
  }

  next();
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
