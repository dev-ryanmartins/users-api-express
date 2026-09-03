import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Keep parsed values separate because Express 5 exposes req.query as read-only.
      res.locals.validated = {};
      if (schemas.body) {
        res.locals.validated.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        res.locals.validated.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        res.locals.validated.query = schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}