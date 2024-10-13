import { User } from "../schema.js";
import yup from "yup";
import { parseCsv } from "./parse-csv.js";
// import bcrypt from "bcrypt";

const NUM_HEADER_ROWS = 3;
const COL_NAME = 0;
const COL_UPI = 3;
const COL_ID = 2;

/**
 * Processes the Canvas gradebook CSV file to add all students in that file to the database.
 *
 * Removes duplicates - i.e. does not add any students who are already in the database.
 *
 * @param {*} csvFile the file to process
 * @returns the result of adding all new students in the file to the database.
 */
export async function addStudentsFromGradebookCSV(csvFile) {
  const records = await parseCsv(csvFile);

  // console.log(records);

  let newStudents = [];

  // Go thru all lines other than the headers.
  for (let recordNum = NUM_HEADER_ROWS; recordNum < records.length; recordNum++) {
    const record = records[recordNum];
    if (!record || record.length === 0) break; // We're done when we reach an empty line

    // Get student from line data (throw error if invalid)
    const student = validatedStudent(record);
    if (!student) continue;

    // If already in DB, skip
    // if (await User.findOne({ emailAddress: student.emailAddress })) continue;

    newStudents.push(student);
  }

  // Do one query for all matching email addresses... faster this way.
  const emailAddresses = newStudents.map((s) => s.emailAddress);
  const existingStudents = await User.find({ emailAddress: { $in: emailAddresses } });
  const existingEmailAddresses = existingStudents.map((s) => s.emailAddress);
  newStudents = newStudents.filter((s) => !existingEmailAddresses.includes(s.emailAddress));

  // Save all students after dupes are removed
  return await User.bulkSave(
    newStudents.map(
      (s) =>
        new User({
          ...s,
          roles: ["student"],
          loginUuid: null,
          githubUsername: null,
          passHash: null // bcrypt.hashSync("password", 10) // TODO Fix this
        })
    )
  );
}

/**
 * A schema for a student from a CSV line. Requires the given params.
 */
const studentSchema = yup
  .object({
    uniId: yup.number().integer().required(),
    firstName: yup.string().min(1).required(),
    lastName: yup.string().min(1).required(),
    emailAddress: yup.string().email().required()
  })
  .required();

/**
 * Validates and returns
 * @param {*} line
 * @returns
 */
function validatedStudent(line) {
  // console.log("LINE:");
  // console.log(line);
  const name = line[COL_NAME];
  if (name === "student, Test") return null; // Don't try to add the test student.
  const commaIndex = name.indexOf(",");

  // HACK: Deal with Tyne's "Sapna" student who has no last name.
  // If firstName or lastName are empty, just make both equal to the non-empty one.
  let firstName = name.substring(commaIndex + 2);
  let lastName = name.substring(0, commaIndex);
  if (firstName === "") firstName = lastName;
  else if (lastName === "") lastName = firstName;

  return studentSchema.validateSync(
    {
      uniId: line[COL_ID],
      firstName,
      lastName,
      emailAddress: `${line[COL_UPI]}@aucklanduni.ac.nz`
    },
    { abortEarly: true, stripUnknown: true }
  );
}
