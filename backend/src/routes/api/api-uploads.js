import express from "express";
import requireAuth from "../../middleware/auth.js";
import multer from "multer";
import { addStudentsFromGradebookCSV } from "../../data/file-upload/student-list-processor.js";
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
    // Delete uploaded file once processed
    fs.rmSync(req.file.path);
    return res.json({ newStudents: result.insertedCount });
  } catch (e) {
    console.error(e);
    return res.sendStatus(422);
  }
});

export default router;
