import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request interface to include requestId
declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
  }
}

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  req.requestId = uuidv4();
  next();
}
