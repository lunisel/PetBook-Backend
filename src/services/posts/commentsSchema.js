import mongoose from "mongoose"

const CommentsSchema = new mongoose.Schema({
    refPost: {type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String, required: true}
})

export default mongoose.model("Comments", CommentsSchema)