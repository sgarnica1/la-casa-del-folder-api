import { Request, Response, NextFunction } from "express";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const status = res.statusCode;

    console.log(`${method} ${path} ${status} - ${duration}ms`);
  });

  next();
}
