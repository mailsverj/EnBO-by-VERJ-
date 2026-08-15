import type { Request, Response, NextFunction } from "express";
import type { SafeUser } from "@workspace/db/schema";

declare module "express-session" {
  interface SessionData {
    user: SafeUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session?.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const hasRole = user.roles.some((r) => roles.includes(r));
    if (!hasRole) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
