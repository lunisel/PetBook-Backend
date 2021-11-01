import mongoose from "mongoose"

const CommentsSchema = new mongoose.Schema({
    refPost: {type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String, required: true}
})

const PostSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    content:{
        text: {type: String, required: true},
        img: {type: String, required: false},
    },
    likes : [{type: mongoose.Schema.Types.ObjectId, ref: "User", required: false}],
    comments: [CommentsSchema]
},{timestamps: true})

export default mongoose.model("Posts", PostSchema)