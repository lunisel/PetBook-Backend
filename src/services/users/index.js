import express from "express";
import UserModel from "./schema.js";
import createHttpError from "http-errors";
import { generateTokens } from "../../utils/jwt.js";
import { JWTAuthMiddleware } from "../../utils/middlewares.js";
import multer from "multer";

const userRouter = express.Router();

//GET ALL USERS WITH QUERY
userRouter.get("/", async (req, res, next) => {
  try {
    const allUsers = await UserModel.find({});
    if (req.query.username !== undefined || req.query.city !== undefined) {
      if (req.query.username) {
        const users = await UserModel.find({ username: req.query.username });
        console.log("🔸USERS FETCHED BY QUERY🙌");
        res.send(users);
      } else if (req.query.city) {
        const users = await UserModel.find({ city: req.query.city });
        console.log("🔸USERS FETCHED BY QUERY🙌");
        res.send(users);
      }
      /* if (req.query.username) {
        const { total, users } = await UserModel.find({ username: query });
        const safeUser = users;
        console.log(safeUser);
        res.send({
          links: query.links("/users", total),
          total,
          users,
          pageTotal: Math.ceil(total / query.options.limit),
        });
        console.log("🔸USERS FETCHED BY QUERY🙌");
      } else if (req.query.city) {
        const { total, users } = await UserModel.find({ city: query });
        res.send({
          links: query.links("/users", total),
          total,
          users,
          pageTotal: Math.ceil(total / query.options.limit),
        });
        console.log("🔸USERS FETCHED BY QUERY🙌");
      } */
    } else {
      res.send(allUsers);
    }
  } catch (error) {
    next(error);
  }
});

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

userRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const filter = { _id: req.user._id };
    const update = { ...req.body };
    const updatedUser = await UserModel.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    await updatedUser.save();
    res.send(updatedUser);
    console.log("🔸USER EDITED BY TOKEN🙌");
  } catch (error) {
    next(error);
  }
});

export default userRouter;
