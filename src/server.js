import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import userRouter from "./services/users/index.js";
import postRouter from "./services/posts/index.js";
import notesRouter from "./services/notes/index.js";

const port = process.env.PORT | 3005;
const mongoConnection = process.env.MONGO_URL;
const server = express();

server.use(cors());
server.use(express.json({limit: "50mb"}));
server.use(express.urlencoded({limit: "50mb", extended: true}))

server.use("/users", userRouter);
server.use("/posts", postRouter);
server.use("/notes", notesRouter)

console.table(listEndpoints(server));

mongoose.connect(mongoConnection, { useNewUrlParser: true }).then(() => {
  server.listen(port, () => {
    console.log("Server listening on port", port, "and connected to DB");
  });
});
