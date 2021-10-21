import mongoose from "mongoose"

const [Schema, model] = mongoose

const UserSchema = new Schema({
    name: {type: String, required: true},
    nickname: {type: String, required: false},
    username: {type: String, unique: true, required: true},
    avatar: {type: String, required: false},
    species: {type: String, required: false},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    bio: {type: String, required: false},
    birthday: {type: String, required: false},
    city: {type: String, required: false},
    myOwner: [{
        name: {type: String, required: false},
        surname: {type: String, required: false},
        avatar: {type: String, required: false},
        birthday: {type: String, required: false},
    }],
    friends: [{type: Schema.Types.ObjectId, ref: User}]
})

export default model("User", UserSchema)