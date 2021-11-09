import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    title: {type: String, required: false},
    text: {type: String, required: false},
    media: [{type: String, required: false}]
}, {timestamps: true})

export default mongoose.model("Notes", NotesSchema);