import express from "express";
import { getCurrentUser, generatedemo } from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/me", isAuth, getCurrentUser);
userRouter.get("/gen", generatedemo);

export default userRouter;