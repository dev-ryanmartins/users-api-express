import type { RequestHandler } from "express";
import { AppError } from "../lib/errors";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new AppError(
      404,
      "ROUTE_NOT_FOUND",
      `A rota ${req.method} ${req.originalUrl} não foi encontrada.`,
    ),
  );
};