import mongoose from "mongoose";
import bcrypt from "bcrypt";

const FriendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const UserSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  nickname: { type: String, required: false },
  username: { type: String, unique: true, required: true },
  avatar: { type: String, required: true, default: "https://animalclinic.org/wp-content/uploads/2019/05/paw-placeholder.png" },
  species: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, required: false },
  birthday: { type: String, required: false },
  city: { type: String, required: false },
  myOwner: {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    ownerAvatar: { type: String, required: true, default: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"},
    birthday: { type: String, required: false },
  },
  followers: [FriendSchema],
  following: [FriendSchema],
  refreshToken: { type: String, required: false },
});

UserSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPW = newUser.password;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 11);
    next();
  }
});

UserSchema.methods.toJSON = function () {
  const userDoc = this;
  const userObj = userDoc.toObject();
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

UserSchema.statics.checkCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

export default mongoose.model("User", UserSchema);
