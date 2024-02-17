import { parseCsv } from "./parse-csv.js";
import { User, ProjectGroup } from "../schema.js";

const NUM_HEADER_ROWS = 1;
const MAX_GROUP_MEMBERS = 6;
const COL_IDEAS = 2;
const COL_QUESTIONS = 3;
const COLS_NAME = [];
const COLS_STUDENTID = [];
const COLS_UPI = [];
for (let i = 0; i < MAX_GROUP_MEMBERS; i++) {
  COLS_NAME.push(i * 3 + 4);
  COLS_STUDENTID.push(i * 3 + 5);
  COLS_UPI.push(i * 3 + 6);
}

/**
 * Processes the group project signup form, downloaded from Google Forms as a CSV.
 *
 * Eventually we will let students signup on this website itself.
 *
 * @param {*} csvFile the file to process
 * @returns the result of adding the file contents to the database
 * @throws errors if unknown or duplicate students are present. Will contain row numbers so we can manually fix the CSV for now.
 */
export async function processProjectSignupCsv(csvFile) {
  const records = await parseCsv(csvFile);

  // Parse individual group records. Throw exception if unknown or duplicate students.
  const parsedRecords = [];
  const errors = [];
  for (let recordNum = NUM_HEADER_ROWS; recordNum < records.length; recordNum++) {
    const record = records[recordNum];
    if (!record || record.length === 0) break; // We're done when we reach an empty line

    try {
      const parsedRecord = await parseGroupRecord(record, recordNum);

      // Check all previous records for duplicate members. Throw exception if so.
      const students = parsedRecord.members.map((m) => m.student.toString());
      parsedRecords.forEach((otherRecord, otherI) => {
        const otherStudents = otherRecord.members.map((m) => m.student.toString());
        otherStudents.forEach((s) => {
          if (students.includes(s))
            throw `Record ${recordNum}: Duplicate student found to record ${otherI + 1}`;
        });
      });

      // If we good, push here.
      parsedRecords.push(parsedRecord);
    } catch (error) {
      errors.push(error);
    }
  }

  // If any errors, throw them - don't modify DB.
  if (errors.length > 0) throw errors;

  // If we get here, all groups are good - add to database.
  const dbGroups = parsedRecords.map(
    (r) =>
      new ProjectGroup({
        ...r,
        isTempName: true,
        githubUrl: null,
        initialEmailSent: false,
        reviewersEmailSent: false,
        notes: "",
        presentationDate: null,
        reviewers: []
      })
  );
  return await ProjectGroup.bulkSave(dbGroups);
}

async function parseGroupRecord(record, num) {
  const members = await parseGroupMembers(record, num);

  return {
    name: `TempName${num}`,
    initialQuestions: record[COL_QUESTIONS],
    initialIdeas: record[COL_IDEAS],
    members: members.map((m) => ({ student: m, isGithubInviteSent: false }))
  };
}

async function parseGroupMembers(record, num) {
  const members = [];
  for (let i = 0; i < MAX_GROUP_MEMBERS; i++) {
    const name = record[COLS_NAME[i]];
    const uniId = record[COLS_STUDENTID[i]];
    const upi = record[COLS_UPI[i]];
    // console.log("Record", num, name, uniId, upi);

    if (!name || name.length === 0) continue; // Skip if blank name

    // Try to get student by id
    let student = await User.findOne({ uniId: parseInt(uniId) });

    // If fail, try to get by upi
    if (!student) student = await User.findOne({ emailAddress: `${upi}@aucklanduni.ac.nz` });

    // If still not found, throw "unknown student" exception
    if (!student) throw `Record ${num}: Found unknown student (${name}, ${uniId}, ${upi})`;

    members.push(student);
  }
  return members;
}
