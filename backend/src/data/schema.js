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
  githubUsername: String,
  isStudentsTeamInviteSent: Boolean
});

const projectGroupSchema = new Schema({
  name: String,
  isTempName: Boolean,
  githubUrl: String,
  imageUrl: String,
  repoInitialized: Boolean,
  repoBPInitialized: Boolean,
  initialEmailSent: Boolean,
  reviewersEmailSent: Boolean,
  initialQuestions: String,
  initialIdeas: String,
  notes: String,
  presentationDate: String,
  members: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isGithubInviteSent: Boolean,
      isTeamInviteSent: Boolean,
      isGithubProjectInviteSetn: Boolean
    }
  ],
  reviewers: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isGithubInviteSent: Boolean
    }
  ]
});

const assignmentSchema = new Schema({});

export const User = mongoose.model("User", userSchema);
export const ProjectGroup = mongoose.model("ProjectGroup", projectGroupSchema);
