import express from "express";
import UserModel from "./schema.js";
import createHttpError from "http-errors";

const userRouter = express.Router();

userRouter.post("/", async (req, resp, next) => {
  try {
    const newUser = new UserModel(req.body);
  } catch (err) {
    next(err);
  }
});

export default userRouter;
