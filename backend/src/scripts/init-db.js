import { DB_URL } from "../env.js";

import mongoose from "mongoose";
import { User } from "../data/schema.js";
import bcrypt from "bcrypt";

await mongoose.connect(DB_URL);

console.log("Connected to db");

await User.deleteMany({});

console.log("db cleared");

const adminUser = await User.create({
  uniId: 3717891,
  firstName: "Andrew",
  lastName: "Meads",
  emailAddress: "andrew.meads@auckland.ac.nz",
  roles: ["admin"],
  passHash: await bcrypt.hash("admin", 10),
  loginUuid: null,
  githubUsername: "andrew-meads"
});

// const testStudent = await User.create({
//   uniId: 1234567,
//   firstName: "Test",
//   lastName: "Student",
//   emailAddress: "anhydrous.storm@gmail.com",
//   roles: ["student"],
//   passHash: await bcrypt.hash("ss", 10),
//   loginUuid: null,
//   githubUsername: null
// });

await adminUser.save();
// await testStudent.save();

console.log("db initialized OK");
await mongoose.disconnect();
console.log("Fin!");
