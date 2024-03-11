import { GITHUB_API_KEY } from "../../env.js";
import express from "express";
import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

const MyOctokit = Octokit.plugin(throttling);

const octokit = new MyOctokit({
  auth: GITHUB_API_KEY,
  userAgent: "cs732-course-admin/v1.0",
  throttle: {
    onRateLimit: (retryAfter, options, octokit, retryCount) => {
      octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

      if (retryCount < 1) {
        // only retries once
        octokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      // does not retry, only logs a warning
      octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
    }
  }
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
