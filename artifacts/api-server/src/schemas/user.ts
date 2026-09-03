import { z } from "zod";

const userFields = {
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  email: z
    .email()
    .trim()
    .max(255, "O e-mail deve ter no máximo 255 caracteres.")
    .transform((value) => value.toLowerCase()),
  active: z.boolean().default(true),
};

export const createUserSchema = z.object(userFields).strict();

export const updateUserSchema = z
  .object({
    name: userFields.name.optional(),
    email: userFields.email.optional(),
    active: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Envie pelo menos um campo para atualizar.",
  });

export const userIdParamsSchema = z.object({
  id: z.string().uuid("O id deve ser um UUID válido."),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  active: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;