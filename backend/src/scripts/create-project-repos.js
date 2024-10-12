import { withDatabase } from "./util.js";
import { octokit, createRepoFromTemplate, addBPRules } from "../external-apis/github.js";
import { ProjectGroup, User } from "../data/schema.js";
import { GITHUB_ORG, GIT_TEMP_DIR, GITHUB_API_KEY, PROJECT_REPO_PREFIX, TEMPLATE_REPO_NAME } from "../env.js";
import fs from "fs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.js";
import path from "path";

await withDatabase(async () => {
  fs.mkdirSync(GIT_TEMP_DIR);

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

  // return;

  // Add initial files if not already done
  try {
    await addInitialFiles(group);
  } catch (err) {
    console.error(`Could not add initial repo files for group ${group.name}!`);
    console.error(err);
    return;
  }

  // Add BP rules if not already done
  try {
    await addBranchProtection(group);
  } catch (err) {
    console.error(`Could not add branch protection rules for group ${group.name}!`);
    console.error(err);
    return;
  }

  // return;

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
  const repoName = `${PROJECT_REPO_PREFIX}${group.name.toLowerCase().replaceAll(" ", "-")}`;
  const githubUrl = `https://github.com/${GITHUB_ORG}/${repoName}`;
  // console.log(githubUrl);

  // Create the thing
  await createRepoFromTemplate(GITHUB_ORG, repoName, TEMPLATE_REPO_NAME);

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
  return path.join(GIT_TEMP_DIR, group.name.replaceAll(" ", "-"));
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

  // Create a temp folder where we will store the git repo files for this group
  console.log(`Initializing repo for group ${group.name} ...`);
  const dirName = getGroupGitDir(group)
  fs.mkdirSync(dirName);

  try {
    // Clone repo here
    const dir = path.join(process.cwd(), dirName);
    await git.clone({
      fs,
      http,
      dir,
      url: group.githubUrl,
      onAuth: () => ({ username: GITHUB_API_KEY }),
    });

    // Edit readme file, copy image over
    personalizeFiles(group);

    // Commit
    await git.add({ fs, dir, filepath: "." });
    await git.commit({
      fs,
      dir,
      message: `Personalized repo for Team ${group.name}`,
      author: { name: "Andrew Meads", email: "andrew.meads@auckland.ac.nz" }
    });

    // Add origin URL
    // await git.addRemote({ fs, dir, remote: "origin", url: group.githubUrl });

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
    // Clean up our mess - this doesn't seem to work.
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

  // Initial file contents
  const readmeFile = path.join(getGroupGitDir(group), "README.md");
  let fileContents = fs.readFileSync(readmeFile, { encoding: "utf-8" });

  // frontend +page.svelte
  const pageDotSvelteFile = path.join(getGroupGitDir(group), "frontend/src/routes/+page.svelte");
  let svelteFileContents = fs.readFileSync(pageDotSvelteFile, { encoding: "utf-8" });

  // Group nmae
  fileContents = fileContents.replaceAll("$GROUPNAME", group.name);

  // Team member names
  const studentNames = group.members
    .map((m) => m.student)
    .map((s) => `- ${s.firstName} ${s.lastName}`)
    .join("\r\n");

  fileContents = fileContents.replaceAll("$TEAMMEMBERS", studentNames);

  // Group image, if it exists
  if (group.imageUrl) {
    const sourcePath = `public/${group.imageUrl}`.replaceAll("%20", " ");

    const destDir = path.join(getGroupGitDir(group), "backend/public/images");
    // fs.mkdirSync(destDir);
    const destFile = group.imageUrl
      .substring(group.imageUrl.lastIndexOf("/") + 1)
      .replaceAll("%20", " ");
    const destPath = path.join(destDir, destFile);

    fs.copyFileSync(sourcePath, destPath);

    fileContents = fileContents.replaceAll(
      "$IMAGE",
      `![](./backend/public/images/${destFile.replaceAll(" ", "%20")})`
    );

    svelteFileContents = svelteFileContents.replaceAll(
      "$IMAGE",
      `<img src={\`\${PUBLIC_IMAGES_URL}/${destFile.replaceAll(" ", "%20")}\`} alt="${group.name}" style="width: 320px" />`
    );

  } else {
    fileContents = fileContents.replaceAll("$IMAGE", "");
    svelteFileContents = svelteFileContents.replaceAll("$IMAGE", "");
  }

  // Write README file and +page.svelte file
  fs.writeFileSync(readmeFile, fileContents, { encoding: "utf-8" });
  fs.writeFileSync(pageDotSvelteFile, svelteFileContents, { encoding: "utf-8" });
}

// function sleep(millis) {
//   return new Promise((resolve) => setTimeout(resolve, millis));
// }

/**
 * If the given group member isn't already added to the given group's repo, adds them.
 *
 * @param {*} group the group
 */
async function addBranchProtection(group) {
  if (group.repoBPInitialized)
    return console.log(`${group.name} already has BP rules added.`);

  console.log(`Adding branch protection rules for ${group.name} ...`);

  // Repo name
  const repoName = group.githubUrl.substring(group.githubUrl.lastIndexOf("/") + 1);

  // Create the thing
  await addBPRules(GITHUB_ORG, repoName);

  // Save record to DB
  group.repoBPInitialized = true;
  await group.save();
}

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
    permission: "write"
  });

  memberRecord.isGithubInviteSent = true;
  await group.save();
}
