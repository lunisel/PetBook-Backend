import express from "express";
import NotesModel from "./schema.js";
import { JWTAuthMiddleware } from "../../utils/middlewares.js";

const notesRouter = express.Router();

notesRouter.get("/me", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    const user = req.user;
    const userId = user._id;
    const myNotes = await NotesModel.find({ user: userId });
    console.log("🔸MY NOTES FETCHED🙌");
    resp.send(myNotes);
  } catch (err) {
    next(err);
  }
});

notesRouter.post("/me", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    const newNote = new NotesModel(req.body);
    console.log(newNote)
    await newNote.save();
    console.log("🔸POSTED A NEW NOTE🙌");
    resp.send(newNote);
  } catch (err) {
    next(err);
  }
});

notesRouter.put("/:noteId", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    const filter = { _id: req.params.noteId };
    const update = { ...req.body };
    const updatedNote = await NotesModel.findByIdAndUpdate(filter, update, {
      returnOriginal: false,
    });
    await updatedNote.save();
    console.log("🔸UPDATED NOTE🙌");
    resp.send(updatedNote);
  } catch (err) {
    next(err);
  }
});

notesRouter.delete("/:noteId", JWTAuthMiddleware, async (req, resp, next) => {
  try {
    const noteId = req.params.noteId;
    const deletedNote = await NotesModel.findByIdAndDelete(noteId);
    console.log("🔸NOTE DELETED SUCCESSFULLY🙌");
    resp.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default notesRouter;
