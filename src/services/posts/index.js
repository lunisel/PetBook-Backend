import express from "express";
import PostModel from "./schema.js";
import { generateTokens } from "../../utils/jwt.js";
import { JWTAuthMiddleware } from "../../utils/middlewares.js";
import multer from "multer";
import { mediaStorage } from "../../utils/mediaStorage.js";

const postRouter = express.Router();

postRouter.post("/", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    let user = req.user;
    let newPost = new PostModel({ ...req.body, user: user._id });
    let { _id } = await newPost.save();
    console.log("🔸POSTED A NEW POST🙌");
    resp.send(newPost);
  } catch (err) {
    next(err);
  }
});

postRouter.get("/me", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    let user = req.user;
    let mePosts = await PostModel.find({ user: user._id })
      .populate("user comments.user", {
        avatar: 1,
        username: 1,
        petName: 1,
        _id: 1,
      })
      .sort({ createdAt: -1 });
    if (mePosts) {
      console.log("🔸ME POSTS FETCHED🙌");
      resp.send(mePosts);
    }
  } catch (err) {
    next(err);
  }
});

postRouter.get("/", async (req, resp, next) => {
  try {
    let posts = await PostModel.find({})
      .populate("user", { avatar: 1, username: 1, petName: 1, _id: 1 })
      .sort({ createdAt: -1 });
    console.log("🔸ALL POSTS FETCHED🙌");
    resp.send(posts);
  } catch (err) {
    next(err);
  }
});

postRouter.delete("/:id", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    let id = req.params.id;
    let deletedPost = await PostModel.findByIdAndDelete(id);
    console.log("🔸POST DELETED SUCCESSFULLY🙌");
    resp.status(204).send("Deleted");
  } catch (err) {
    next(err);
  }
});

/* ------------------------------COMMENTS---------------------------------- */

postRouter.post("/:id/comments", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    const id = req.params.id;
    let post = await PostModel.findById(id);
    let newComment = {
      refPost: id,
      user: req.user._id,
      text: req.body.text,
    };
    post.comments.push(newComment);
    await post.save();
    let newPost = await PostModel.findById(id).populate("comments.user", {
      avatar: 1,
      username: 1,
      _id: 1,
    });
    console.log("🔸COMMENT POSTED🙌");
    resp.send(newPost);
  } catch (err) {
    console.log("error catch comment post ->", err);
    next(err);
  }
});

postRouter.put(
  "/:id/deleteComment/:commentId",
  JWTAuthMiddleware,
  async (req, resp, next) => {
    try {
      let postId = req.params.id;
      let post = await PostModel.findById(postId).populate("comments.user", {
        avatar: 1,
        username: 1,
        _id: 1,
      });
      let newComments = post.comments.filter(
        (c) => c._id.toString() !== req.params.commentId
      );
      post.comments = newComments;
      await post.save();
      resp.send(post);
    } catch (err) {
      next(err);
    }
  }
);

/* ---------------------------------------LIKE ROUTERS---------------------------------- */

postRouter.post("/:id/like", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    let currentUser = req.user;
    let currentUserId = currentUser._id;
    let postId = req.params.id;
    let post = await PostModel.findById(postId);
    post.likes.push(currentUserId);
    await post.save();
    resp.send(post);
  } catch (err) {
    next(err);
  }
});

postRouter.post("/:id/dislike", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    let currentUser = req.user;
    let currentUserId = currentUser._id;
    let postId = req.params.id;
    let post = await PostModel.findById(postId);
    let newLikesArr = post.likes.filter(
      (u) => u.toString() !== currentUserId.toString()
    );
    post.likes = newLikesArr;
    await post.save();
    resp.send(post);
  } catch (err) {
    next(err);
  }
});

/* -------------------- DISPLAY POSTS FROM MY CITY ---------------------- */

postRouter.post("/feed", async (req, resp, next) => {
  try {
    let arrOfUsers = req.body;
    let arrOfPosts = [];
    for (let i = 0; i < arrOfUsers.length; i++) {
      let postsByUser = await PostModel.find({
        user: arrOfUsers[i],
        "content.img": { $exists: true },
      }).populate("user comments.user", {
        avatar: 1,
        username: 1,
        petName: 1,
        _id: 1,
      });
      arrOfPosts.push(...postsByUser);
    }

    if (arrOfPosts !== []) {
      console.log("FEED WITH QUERY FETCHED", arrOfUsers.length);
      resp.send(arrOfPosts);
    }
  } catch (err) {
    next(err);
  }
});

/* ---------------------------GET POSTS OF FRIENDS-------------------------- */

postRouter.get("/friends", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    let currentUser = req.user;
    let following = currentUser.following;
    let friendsId = following.map((u) => u.user.toString());
    let friendsPostsArr = [];
    for (let i = 0; i < friendsId.length; i++) {
      let postsOfF = await PostModel.find({ user: friendsId[i] }).populate(
        "user comments.user",
        { petName: 1, avatar: 1, _id: 1, username: 1 }
      );
      friendsPostsArr.push(...postsOfF);
    }
    let myPosts = await PostModel.find({ user: currentUser._id }).populate(
      "user comments.user",
      { petName: 1, avatar: 1, _id: 1, username: 1 }
    );
    friendsPostsArr.push(...myPosts);
    console.log("HOME POSTS FETCHED !!");
    resp.send(friendsPostsArr);
  } catch (err) {
    next(err);
  }
});

export default postRouter;
