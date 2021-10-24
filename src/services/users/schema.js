import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: Number,
    enums: [
      0, //add friend,
      1, //requested,
      2, //friends
    ],
  },
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String, required: false },
  username: { type: String, unique: true, required: true },
  avatar: { type: String, required: false },
  species: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, required: false },
  birthday: { type: String, required: false },
  city: { type: String, required: false },
  myOwner: [
    {
      name: { type: String, required: false },
      surname: { type: String, required: false },
      avatar: { type: String, required: false },
      birthday: { type: String, required: false },
    },
  ],
  friends: [FriendSchema],
  refreshToken: { type: String, required: false },
});

export default mongoose.model("User", UserSchema);
