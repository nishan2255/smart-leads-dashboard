import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types/index.js';

/**
 * Role-based access control middleware.
 * Accepts one or more roles; if the authenticated user's role
 * is not in the allowed list, responds with 403.
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};
