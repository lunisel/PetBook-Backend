import express from "express";
import UserModel from "./schema.js";
import createHttpError from "http-errors";
import { generateTokens } from "../../utils/jwt.js";
import {JWTAuthMiddleware} from "../../utils/middlewares.js"

const userRouter = express.Router();


//REGISTRATION
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

//LOGIN
userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);
    if (user !== null) {
      const { accessToken, refreshToken } = await generateTokens(user);
      res.send({ accessToken, refreshToken });
      console.log("🔸USER LOGGED IN BY EMAIL, PASSWORD🙌");
    } else {
      res.status(401).send("👻 Something's wrong with your credentials!");
    }
  } catch (err) {
    next(err);
  }
});

//GET ME FROM TOKEN
userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
    console.log("🔸USER FETCHED BY TOKEN🙌");
  } catch (error) {
    next(error);
  }
});

export default userRouter;
