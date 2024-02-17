import express from "express";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,
  userAgent: "cs732-course-admin/v1.0"
});

const router = express.Router();

router.post("/verify", async (req, res) => {
  /**@type string */
  let username = req.body.username;

  // If no username provided, get outta here
  if (!username) return res.sendStatus(404);

  // Allow submission of the user's GH profile page URL
  if (username.startsWith("https://")) username = username.substring(username.lastIndexOf("/") + 1);

  // Remove leading "@"
  if (username.startsWith("@")) username = username.substring(1);

  try {
    const {
      data: { login }
    } = await octokit.rest.users.getByUsername({ username });
    // console.log(login);
    return res.json({ username: login });
  } catch {
    // console.log("Not found");
    return res.sendStatus(404);
  }
});

export default router;
