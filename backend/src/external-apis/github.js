import { GITHUB_API_KEY } from "../env.js";
import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

const MyOctokit = Octokit.plugin(throttling);
export const octokit = new MyOctokit({
  auth: GITHUB_API_KEY,
  userAgent: "course-admin/v1.0",
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

/**
 * Creates a repo with the given name in the given org / owner from the given template, and waits for
 * the main branch to exist before returning. Assumes the template has the same owner as the repo.
 * 
 * @param {string} ownerName the name of the owner (e.g. an org or user name)
 * @param {string} repoName  the name of the new repo to create
 * @param {string} templateName the name of the template repo to use
 */
export async function createRepoFromTemplate(ownerName, repoName, templateName) {

  await octokit.rest.repos.createUsingTemplate({
    template_owner: ownerName,
    template_repo: templateName,
    owner: ownerName,
    name: repoName,
    private: true
  });

  // Wait for main branch to be available, then we know repo is done creating.
  console.log("Waiting for main branch...");
  await waitForBranch(ownerName, repoName);
  console.log("Main branch found!");
}

/**
 * Waits for GitHub to realize that the given branch exists in the given repo.
 * 
 * @param {string} ownerName 
 * @param {string} repoName 
 * @param {string} branchName 
 */
export async function waitForBranch(ownerName, repoName, branchName = "main") {
  let getBranchResponse;
  do {
    try {
      getBranchResponse = await octokit.rest.repos.getBranch({
        owner: ownerName,
        repo: repoName,
        branch: branchName
      });

      // console.log(getBranchResponse.status);
    } catch (err) {
      // console.log(err.status);
    }
  } while (getBranchResponse?.status !== 200);
}

/**
 * Adds branch protection to the given branch on the given repo, so that you can't push
 * directly to that branch and require a PR with at least one approval.
 * 
 * @param {string} ownerName 
 * @param {string} repoName 
 * @param {string} branchName 
 */
export async function addBPRules(ownerName, repoName, branchName = "main") {

  return await octokit.rest.repos.updateBranchProtection({
    owner: ownerName,
    repo: repoName,
    branch: branchName,
    required_status_checks: null,
    enforce_admins: null,
    required_pull_request_reviews: {
      required_approving_review_count: 1
    },
    restrictions: null
  });
}