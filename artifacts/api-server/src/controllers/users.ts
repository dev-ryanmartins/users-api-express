import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors";
import { userStore } from "../lib/user-store";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserListQuery,
} from "../schemas/user";

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, search, active } =
      res.locals.validated.query as UserListQuery;
    const users = await userStore.list();
    const normalizedSearch = search?.toLowerCase();
    const filteredUsers = users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);
      const matchesActive = active === undefined || user.active === active;
      return matchesSearch && matchesActive;
    });
    const start = (page - 1) * limit;

    res.json({
      data: filteredUsers.slice(start, start + limit),
      meta: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = res.locals.validated.params as { id: string };
    const user = await userStore.findById(id);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "Usuário não encontrado.");
    }
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await userStore.create(
      res.locals.validated.body as CreateUserInput,
    );
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = res.locals.validated.params as { id: string };
    const user = await userStore.update(
      id,
      res.locals.validated.body as UpdateUserInput,
    );
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = res.locals.validated.params as { id: string };
    await userStore.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}