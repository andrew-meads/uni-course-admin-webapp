import fs from "fs";
import mongoose from "mongoose";
import { DB_URL } from "../env.js";
import { User, ProjectGroup } from "../data/schema.js";

const HEADER_ROW =
  "Number,Name,Repo URL,Name,Student ID,UPI,GitHub username,(Proposed impl grade),Implementataion grade,Implementation comments,Presentation grade,Presentation comments,Report grade,Report comments,Private comments / issues\r\n";

function firstRowOfGroup(number, group, firstStudent) {
  const { name, githubUrl } = group;
  const { uniId, firstName, lastName, emailAddress, githubUsername } = firstStudent;
  const upi = emailAddress.substring(0, emailAddress.indexOf("@"));
  return `${number},${name},${githubUrl},${firstName} ${lastName},${uniId},${upi},${githubUsername},,,,,,,,\r\n`;
}

function studentRow(student) {
  const { uniId, firstName, lastName, emailAddress, githubUsername } = student;
  const upi = emailAddress.substring(0, emailAddress.indexOf("@"));
  return `,,,${firstName} ${lastName},${uniId},${upi},${githubUsername},,,,,,,,\r\n`;
}

await mongoose.connect(DB_URL);

const groups = await ProjectGroup.find({}).populate("members.student");

let data = HEADER_ROW;

for (let groupI = 0; groupI < groups.length; groupI++) {
  const group = groups[groupI];
  const students = group.members.map((m) => m.student);

  data += firstRowOfGroup(groupI + 1, group, students[0]);

  for (let studentI = 1; studentI < students.length; studentI++) {
    data += studentRow(students[studentI]);
  }

  data += "\r\n";
}

fs.writeFileSync("out/projects.csv", data, { encoding: "utf-8" });
console.log("Done!");
await mongoose.disconnect();
