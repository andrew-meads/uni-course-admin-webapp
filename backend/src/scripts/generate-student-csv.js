import mongoose from "mongoose";
import { DB_URL } from "../env.js";
import { User } from "../data/schema.js";
import fs from "fs";

await mongoose.connect(DB_URL);

const students = await User.find({ roles: "student" });
console.log(`${students.length} students found.`);

let content = "Name,ID,UPI,GitHub Username\r\n";

for (const student of students) {
  const row = `"${student.lastName}, ${student.firstName}",${student.uniId},"${student.emailAddress.substring(0, student.emailAddress.indexOf("@"))}","${student.githubUsername ?? ""}"\r\n`;

  content += row;
}

if (!fs.existsSync("out")) fs.mkdirSync("out");
fs.writeFileSync("out/my-file.csv", content, { encoding: "utf-8" });

await mongoose.disconnect();
console.log("Done!");
