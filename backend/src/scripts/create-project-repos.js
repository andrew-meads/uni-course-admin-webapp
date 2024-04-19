import { withDatabase } from "./util.js";
import { octokit } from "../external-apis/github.js";
import { ProjectGroup, User } from "../data/schema.js";
import { GITHUB_ORG, GIT_TEMP_DIR, GITHUB_API_KEY } from "../env.js";
import fs from "fs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.js";
import path from "path";

await withDatabase(async () => {
  fs.mkdirSync(GIT_TEMP_DIR);

  //   const org = await octokit.rest.orgs.get({ org: GITHUB_ORG });
  //   console.log(org);

  let counter = 0;
  const groups = await ProjectGroup.find({}).populate("members.student");
  for (const group of groups) {
    await processGroup(group);
    counter++;

    // if (counter === 1) break;
  }

  console.log(`${counter} groups processed.`);
});

/**
 * Processes one group:
 * - Creates repo if not already created
 * - Initializes repo if not already initialized
 * - Adds team members who have not been added yet
 *
 * @param {*} group the group to process
 */
async function processGroup(group) {
  // Create group repo if not already created
  try {
    await createProjectRepo(group);
  } catch (err) {
    console.error(`Could not create project repo for group ${group.name}!`);
    console.error(err);
    return;
  }

  // Add initial files if not already done
  try {
    await addInitialFiles(group);
  } catch (err) {
    console.error(`Could not add initial repo files for group ${group.name}!`);
    console.error(err);
    return;
  }

  for (const memberRecord of group.members) {
    try {
      await addGroupMemberToRepo(group, memberRecord);
    } catch (err) {
      console.error(
        `Could not add member ${memberRecord.student.firstName} ${memberRecord.student.lastName} to ${group.name}'s repo!`
      );
      console.error(err);
    }
  }
}

/**
 * If the repo for the given group has not been created yet, this creates it.
 *
 * @param {*} group the group whose repo to create
 * @throws error if the repo cannot be created.
 */
async function createProjectRepo(group) {
  if (group.githubUrl)
    return console.log(`${group.name} already has a GitHub repo: ${group.githubUrl}`);

  console.log(`Creating GitHub repo for ${group.name} ...`);

  // Repo name
  const repoName = `project-group-${group.name.toLowerCase().replace(" ", "-")}`;
  const githubUrl = `https://github.com/${GITHUB_ORG}/${repoName}`;
  // console.log(githubUrl);

  // Create the thing
  await octokit.rest.repos.createInOrg({
    org: GITHUB_ORG,
    name: repoName,
    description: `Project repository for team ${group.name}`,
    private: true,
    auto_init: false
  });

  // Set GH URL, save to DB
  group.githubUrl = githubUrl;
  await group.save();
}

/**
 * Gets a directory to use as the temp dir for the given group.
 *
 * @param {*} group the group
 * @returns the group's temp git dir on this system.
 */
function getGroupGitDir(group) {
  return path.join(GIT_TEMP_DIR, group.name.replace(" ", "-"));
}

/**
 * Adds personalized initial files to the given group's repo, and pushes to GitHub.
 *
 * @param {*} group the group
 * @throws error if either files could not be added, or the git push fails.
 */
async function addInitialFiles(group) {
  if (group.repoInitialized)
    return console.log(`Repo for group ${group.name} is already initialized.`);

  console.log(`Initializing repo for group ${group.name} ...`);
  fs.mkdirSync(getGroupGitDir(group));
  try {
    // Init repo
    const dir = path.join(process.cwd(), getGroupGitDir(group));
    await git.init({ fs, dir, defaultBranch: "main" });

    // Copy files across
    const files = fs.readdirSync("project-repo-template");
    for (const file of files) {
      fs.copyFileSync(
        path.join("project-repo-template", file),
        path.join(getGroupGitDir(group), file)
      );
    }

    // Edit readme file, copy image over
    personalizeFiles(group);

    // Commit
    await git.add({ fs, dir, filepath: "." });
    await git.commit({
      fs,
      dir,
      message: "Initial commit",
      author: { name: "Andrew Meads", email: "andrew.meads@auckland.ac.nz" }
    });

    // Add origin URL
    await git.addRemote({ fs, dir, remote: "origin", url: group.githubUrl });

    // Push!
    await git.push({
      fs,
      http,
      dir,
      onAuth: () => ({ username: GITHUB_API_KEY }),
      remote: "origin",
      ref: "main"
    });

    // Save the fact that we have done this.
    group.repoInitialized = true;
    await group.save();
  } finally {
    // Clean up our mess
    // sleep(1000);
    // fs.rmSync(GIT_TEMP_DIR, { recursive: true, force: true });
  }
}

/**
 * Personalizes and adds files to the given group's git repo working dir on this machine.
 *
 * @param {*} group the group whose personalized files to add.
 */
function personalizeFiles(group) {
  const readmeFile = path.join(getGroupGitDir(group), "README.md");
  let fileContents = fs.readFileSync(readmeFile, { encoding: "utf-8" });

  // Group nmae
  fileContents = fileContents.replace("$GROUPNAME", group.name);

  // Team member names
  const studentNames = group.members
    .map((m) => m.student)
    .map((s) => `- ${s.firstName} ${s.lastName}`)
    .join("\r\n");

  fileContents = fileContents.replace("$TEAMMEMBERS", studentNames);

  // Group image, if it exists
  if (group.imageUrl) {
    const sourcePath = `public/${group.imageUrl}`.replace("%20", " ");
    const destDir = path.join(getGroupGitDir(group), "group-image");
    fs.mkdirSync(destDir);
    const destFile = group.imageUrl
      .substring(group.imageUrl.lastIndexOf("/") + 1)
      .replace("%20", " ");
    const destPath = path.join(destDir, destFile);
    fs.copyFileSync(sourcePath, destPath);
    fileContents = fileContents.replace(
      "$IMAGE",
      `![](./group-image/${destFile.replace(" ", "%20")})`
    );
  } else {
    fileContents = fileContents.replace("$IMAGE", "");
  }

  fs.writeFileSync(readmeFile, fileContents, { encoding: "utf-8" });
}

// function sleep(millis) {
//   return new Promise((resolve) => setTimeout(resolve, millis));
// }

/**
 * If the given group member isn't already added to the given group's repo, adds them.
 *
 * @param {*} group the group
 * @param {*} memberRecord the member's record
 */
async function addGroupMemberToRepo(group, memberRecord) {
  const { student, isGithubInviteSent } = memberRecord;
  const studentName = `${student.firstName} ${student.lastName}`;
  if (isGithubInviteSent)
    return console.log(`${studentName} has already been invited to ${group.name}'s repo.`);

  if (!student.githubUsername)
    return console.log(`${studentName} has not provided their GitHub username!`);

  console.log(`Adding ${studentName} to ${group.name}'s repo...`);
  const repo = group.githubUrl.substring(group.githubUrl.lastIndexOf("/") + 1);
  await octokit.rest.repos.addCollaborator({
    owner: GITHUB_ORG,
    username: student.githubUsername,
    repo,
    permission: "admin"
  });

  memberRecord.isGithubInviteSent = true;
  await group.save();
}
