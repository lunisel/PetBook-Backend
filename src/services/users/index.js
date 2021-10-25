import express from "express";
import UserModel from "./schema.js";
import createHttpError from "http-errors";
import { generateTokens } from "../../utils/jwt.js";

const userRouter = express.Router();

userRouter.post("/", async (req, resp, next) => {
  try {
    const newUser = new UserModel(req.body);
    const users = await UserModel.find();
    if (users.findIndex((u) => u.email === newUser.email) === -1) {
      const { _id } = await newUser.save();
      console.log("NEW USER SAVED🙌");
      if (newUser) {
        const { accessToken, refreshToken } = await generateTokens(newUser);
        resp.status(201).send({ newUser, accessToken, refreshToken });
      }
    } else {
      resp.status(422).send({ error: "Duplicate emails cannot be processed" });
    }
  } catch (err) {
    next(err);
  }
});

export default userRouter;
