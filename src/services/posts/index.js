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
      .populate("user", { avatar: 1, username: 1, petName: 1, _id: 1 }).populate("comments")
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

postRouter.post("/:id/comments", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    const id =  req.params.id ;
    let post= await PostModel.findById(id)
    post.comments.push(newComment)
    await post.save();
    console.log("🔸COMMENT POSTED🙌");
    resp.send(post);
  } catch (err) {
    console.log("error catch comment post ->",err)
    next(err);
  }
});

postRouter.get("/:id/comments", JWTAuthMiddleware, async (req, resp, next) =>{
  try{}catch(err){next(err)}
})

export default postRouter;
