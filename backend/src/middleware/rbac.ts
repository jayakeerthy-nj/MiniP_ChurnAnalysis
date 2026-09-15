import { Request, Response, NextFunction } from "express";

export const requireRole = (allowedRoles: Array<"ADMIN" | "ANALYST" | "MANAGER">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`
      });
      return;
    }

    next();
  };
};
