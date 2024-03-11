import express from "express";
import requireAuth from "../../middleware/auth.js";
import multer from "multer";
import { addStudentsFromGradebookCSV } from "../../data/file-upload/student-list-processor.js";
import { processGithubUsernameCsv } from "../../data/file-upload/github-username-processor.js";
import { processProjectSignupCsv } from "../../data/file-upload/project-signup-processor.js";
import fs from "fs";

const upload = multer({ dest: "temp" });

const router = express.Router();

/**
 * Accepts a file upload containing the gradebook CSV. Adds students to the DB from this file.
 *
 * Returns a 200 OK response with the number of new students added, or a 422 if an invalid file
 * is uploaded.
 *
 * Requires admin rights
 */
router.post("/student-list", requireAuth("admin"), upload.single("file"), async (req, res) => {
  try {
    const result = await addStudentsFromGradebookCSV(req.file.path);
    console.log(`${result.insertedCount} students added`);
    return res.json({ newStudents: result.insertedCount });
  } catch (e) {
    console.error(e);
    return res.sendStatus(422);
  } finally {
    // Delete uploaded file once processed
    fs.rmSync(req.file.path);
  }
});

/**
 * Accepts a file upload containing the "github usernames" Google Form CSV. Adds all verified GitHub usernames
 * to existing student accounts.
 *
 * Returns an array of errors - that is, any invalid usernames or invalid students.
 */
router.post("/github-usernames", requireAuth("admin"), upload.single("file"), async (req, res) => {
  const errors = await processGithubUsernameCsv(req.file.path);
  fs.rmSync(req.file.path);
  return res.json(errors);
});

/**
 * Accepts a file upload containing the "project signups" Google Form CSV. If the entire CSV is valid,
 * adds all groups to the database and returns the number of groups added.
 *
 * If any part of the CSV is invalid, the DB is not modified, and a 422 response is returned containing
 * the error info.
 */
router.post("/project-signup", requireAuth("admin"), upload.single("file"), async (req, res) => {
  try {
    const result = await processProjectSignupCsv(req.file.path);
    console.log(`${result.insertedCount} project groups added`);
    return res.json({ newGroups: result.insertedCount });
  } catch (errors) {
    return res.status(422).json(errors);
  } finally {
    fs.rmSync(req.file.path);
  }
});

export default router;
