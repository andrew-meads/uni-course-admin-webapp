import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  uniId: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  emailAddress: { type: String, required: true, unique: true },
  passHash: String,
  roles: [{ type: String, enum: ["admin", "student"] }],
  loginUuid: String,
  githubUsername: String
});

export const User = mongoose.model("User", userSchema);
