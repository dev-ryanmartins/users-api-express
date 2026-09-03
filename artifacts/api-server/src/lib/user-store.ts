import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { User } from "../types/user";
import { AppError } from "./errors";

const dataFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/users.json",
);

const initialUsers: User[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Ana Souza",
    email: "ana.souza@example.com",
    active: true,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
  },
];

export class UserStore {
  private users: User[] | null = null;
  private writeQueue: Promise<unknown> = Promise.resolve();

  private async load(): Promise<User[]> {
    if (this.users) {
      return this.users;
    }

    await mkdir(path.dirname(dataFile), { recursive: true });

    try {
      const content = await readFile(dataFile, "utf8");
      const parsed: unknown = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error("The user data file must contain an array.");
      }
      this.users = parsed as User[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
      this.users = structuredClone(initialUsers);
      await this.persist();
    }

    return this.users;
  }

  private async persist(): Promise<void> {
    const temporaryFile = `${dataFile}.tmp`;
    // Rename is atomic on the same filesystem, preventing half-written JSON.
    await writeFile(
      temporaryFile,
      `${JSON.stringify(this.users ?? [], null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryFile, dataFile);
  }

  private async mutate<T>(
    operation: (users: User[]) => T | Promise<T>,
  ): Promise<T> {
    // Serialize mutations so concurrent requests cannot overwrite each other.
    const run = this.writeQueue.then(async () => {
      const users = await this.load();
      const result = await operation(users);
      await this.persist();
      return result;
    });

    this.writeQueue = run.catch(() => undefined);
    return run;
  }

  async list(): Promise<User[]> {
    await this.writeQueue;
    return structuredClone(await this.load());
  }

  async findById(id: string): Promise<User | undefined> {
    const users = await this.list();
    return users.find((user) => user.id === id);
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    return this.mutate((users) => {
      if (users.some((user) => user.email === data.email)) {
        throw new AppError(
          409,
          "EMAIL_ALREADY_EXISTS",
          "Já existe um usuário cadastrado com este e-mail.",
        );
      }

      const now = new Date().toISOString();
      const user: User = {
        ...data,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      users.push(user);
      return structuredClone(user);
    });
  }

  async update(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
  ): Promise<User> {
    return this.mutate((users) => {
      const user = users.find((item) => item.id === id);
      if (!user) {
        throw new AppError(404, "USER_NOT_FOUND", "Usuário não encontrado.");
      }

      if (
        data.email &&
        users.some((item) => item.id !== id && item.email === data.email)
      ) {
        throw new AppError(
          409,
          "EMAIL_ALREADY_EXISTS",
          "Já existe um usuário cadastrado com este e-mail.",
        );
      }

      Object.assign(user, data, { updatedAt: new Date().toISOString() });
      return structuredClone(user);
    });
  }

  async delete(id: string): Promise<void> {
    return this.mutate((users) => {
      const index = users.findIndex((user) => user.id === id);
      if (index === -1) {
        throw new AppError(404, "USER_NOT_FOUND", "Usuário não encontrado.");
      }
      users.splice(index, 1);
    });
  }
}

export const userStore = new UserStore();