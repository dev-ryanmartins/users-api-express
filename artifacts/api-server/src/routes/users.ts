import { Router, type IRouter } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/users";
import { validate } from "../middlewares/validate";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  userListQuerySchema,
} from "../schemas/user";

const router: IRouter = Router();

router.get("/", validate({ query: userListQuerySchema }), listUsers);
router.get(
  "/:id",
  validate({ params: userIdParamsSchema }),
  getUser,
);
router.post("/", validate({ body: createUserSchema }), createUser);
router.patch(
  "/:id",
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  updateUser,
);
router.delete(
  "/:id",
  validate({ params: userIdParamsSchema }),
  deleteUser,
);

export default router;