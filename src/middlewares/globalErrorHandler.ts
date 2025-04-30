
import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    // impoertant! for security : As error stack can contain sensitive information, it is recommended to only log the error stack in the development environment, and not in the production environment
    // thats why :
    errorStack: config.env === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;
