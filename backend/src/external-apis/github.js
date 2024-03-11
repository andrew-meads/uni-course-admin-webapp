import { GITHUB_API_KEY } from "../env.js";
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

export async function verifyGitHubUsername(username) {
  // If no username provided, get outta here
  if (!username) throw "No username provided";

  // Allow submission of the user's GH profile page URL
  if (username.startsWith("https://")) username = username.substring(username.lastIndexOf("/") + 1);

  // Remove leading "@"
  if (username.startsWith("@")) username = username.substring(1);

  // Get actual username from GitHub API
  const {
    data: { login }
  } = await octokit.rest.users.getByUsername({ username });

  // Return it
  return login;
}
