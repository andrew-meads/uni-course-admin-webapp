import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,
  userAgent: "cs732-course-admin/v1.0"
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
