import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Os dados enviados são inválidos.",
        details: error.issues.map((issue) => ({
          field: issue.path.join(".") || "body",
          message: issue.message,
        })),
      },
    });
    return;
  }

  const normalizedError =
    error instanceof AppError
      ? error
      : new AppError(
          500,
          "INTERNAL_SERVER_ERROR",
          "Ocorreu um erro interno no servidor.",
        );

  if (normalizedError.statusCode >= 500) {
    req.log.error({ err: error }, normalizedError.message);
  }

  res.status(normalizedError.statusCode).json({
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
      ...(normalizedError.details
        ? { details: normalizedError.details }
        : {}),
    },
  });
};