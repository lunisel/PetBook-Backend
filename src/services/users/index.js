import express from "express";
import UserModel from "./schema.js";
import { generateTokens, verifyRefreshJWT } from "../../utils/jwt.js";
import { JWTAuthMiddleware } from "../../utils/middlewares.js";

const userRouter = express.Router();

//GET ALL USERS WITH QUERY
userRouter.get("/", async (req, resp, next) => {
  try {
    const allUsers = await UserModel.find({});
    if (req.query.username !== undefined || req.query.city !== undefined) {
      if (req.query.username) {
        const users = await UserModel.find({
          username: { $regex: req.query.username, $options: "i" },
        });
        console.log("🔸USERS FETCHED BY QUERY🙌");
        resp.send(users);
      } else if (req.query.city) {
        const users = await UserModel.find({
          city: { $regex: req.query.city, $options: "i" },
        });
        console.log("🔸USERS FETCHED BY QUERY🙌");
        resp.send(users);
      }
    } else {
      resp.send(allUsers);
    }
  } catch (err) {
    next(err);
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

// NEW ACCESS TOKEN FROM REFRESH TOKEN
userRouter.post("/session", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decodedToken = await verifyRefreshJWT(refreshToken);
    const user = await UserModel.findById(decodedToken._id);
    if (user.refreshToken === refreshToken) {
      const { accessToken, refreshToken } = await generateTokens(user);
      console.log("🔸SESSION REFRESHED WITH REFRESH TOKEN🙌");
      res.send({ accessToken, refreshToken });
    } else {
      res.status(401).send("👻 Something's wrong with your credentials!");
    }
  } catch (err) {
    next(err);
  }
});

//UPDATE USER WITH TOKEN

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

//UPDATE USER AVATAR
userRouter.put(
  "/me/owner/avatar",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      let user = req.user
      let owner = user.myOwner
      let newOwner = {
        ...owner,
        ...req.body
      }
      user.myOwner = newOwner
      await user.save()
      res.send(user);
    } catch (error) {
      next(error);
    }
  }
);

//GET SINGLE USER WITH ID

userRouter.get("/friend/:id", async (req, resp, next) => {
  try {
    let user = await UserModel.findById(req.params.id);
    if (user) resp.send(user);
  } catch (err) {
    next(err);
  }
});

userRouter.post("/friends/add", JWTAuthMiddleware, async (req, res, next) => {
  try {
    let me = req.user;
    let filter = me.following.filter(
      (u) => u.user.toString() === req.body.user
    );
    if (filter.length > 0) {
      console.log("🔸FRIEND ALREADY IN YOUR FOLLOWINGS🙌");
      res.send(me);
    } else {
      me.following.push(req.body);
      await me.save();
      let otherUser = await UserModel.findById(req.body.user);
      otherUser.followers.push(me._id);
      await otherUser.save();
      console.log("🔸FRIEND ADDED TO YOUR FOLLOWING🙌");
      res.send(me);
    }
  } catch (err) {
    next(err);
  }
});

userRouter.post(
  "/friends/remove",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      let currentUser = req.user;
      let currentUserId = req.user._id;
      let otherUserId = req.body.user;
      let otherUser = await UserModel.findById(otherUserId);

      let othersNewFollowers = otherUser.followers.filter(
        (u) => u._id.toString() !== currentUserId.toString()
      );
      otherUser.followers = othersNewFollowers;
      await otherUser.save();

      let myNewFollowing = currentUser.following.filter(
        (u) => u.user.toString() !== otherUserId.toString()
      );
      currentUser.following = myNewFollowing;
      await currentUser.save();

      res.send(currentUser);
    } catch (err) {
      next(err);
    }
  }
);

/* ---------GET PROFILE FROM USERNAME----------- */

userRouter.get("/profile/:username", async (req, resp, next) => {
  try {
    let username = req.params.username;
    let user = await UserModel.find({ username: username });
    console.log("🔸FRIEND FETCHED🙌");
    resp.send(user[0]);
  } catch (err) {
    next(err);
  }
});

export default userRouter;
