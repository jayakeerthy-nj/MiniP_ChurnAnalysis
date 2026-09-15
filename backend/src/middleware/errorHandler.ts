import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[API Error] ${req.method} ${req.url}:`, err.message || err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};
