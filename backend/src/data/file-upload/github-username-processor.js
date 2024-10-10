import { parseCsv } from "./parse-csv.js";
import { verifyGitHubUsername } from "../../external-apis/github.js";
import { User } from "../schema.js";

// Columns:
// Timestamp, Email Address, Name, Student ID, UPI, GitHub username
const NUM_HEADER_ROWS = 1;
const COL_EMAIL = 1;
const COL_USERNAME = 5;

/**
 *
 * @param {*} csvFile the file to process
 * @return any "unknown student" or "invalid username" errors
 */
export async function processGithubUsernameCsv(csvFile) {
  const errors = [];

  const records = await parseCsv(csvFile);
  for (let recordNum = NUM_HEADER_ROWS; recordNum < records.length; recordNum++) {
    const record = records[recordNum];
    if (!record || record.length === 0) break; // We're done when we reach an empty line

    const emailAddress = record[COL_EMAIL];
    const githubUsername = record[COL_USERNAME];

    // Find student
    const student = await User.findOne({ emailAddress });

    // If the student doesn't exist, lodge an error
    if (!student) {
      errors.push({ type: "unknownStudent", emailAddress });
      continue;
    }

    // If student has already registered this GitHub username, don't need to process again
    if (student.githubUsername === githubUsername) continue;

    let verifiedLogin;
    try {
      verifiedLogin = await verifyGitHubUsername(githubUsername);
      console.log(`#${recordNum}: ${emailAddress} => ${verifiedLogin}`);

      // If verified, save to db.
      await User.findByIdAndUpdate(student._id, { githubUsername: verifiedLogin });
    } catch {
      errors.push({ type: "invalidUsername", emailAddress, githubUsername });
    }
  }

  return errors;
}
