import { withDatabase } from "./util.js";
import { octokit } from "../external-apis/github.js";
import { GITHUB_ORG } from "../env.js";
import { ProjectGroup, User } from "../data/schema.js";

await withDatabase(async () => {

    let counter = 0;
    const groups = await ProjectGroup.find({}).populate("members.student");
    for (const group of groups) {
        await createTeamProject(group);
        counter++;

        if (counter === 1) break;
    }

    console.log(`${counter} groups processed.`);

});

async function createTeamProject(group) {

    if (group.githubProjectId)
        return console.log(`GitHub Project already created for ${group.name}`);

    const teamSlug = `team-${group.name.toLowerCase().replaceAll(" ", "-")}-full-time`;
    const teamExists = await checkTeam(teamSlug);
    if (!teamExists)
        return console.log(`${group.name} must have their Team created before their project!`);

    const repoName = group.githubUrl.substring(group.githubUrl.lastIndexOf("/") + 1);

    const projectName = `Project ${group.name} (Full-Time)`;
    // const projectSlug = `project-${group.name.toLowerCase().replaceAll(" ", "-")}-full-time`;

    try {

        const project = await octokit.request(`POST /repos/${GITHUB_ORG}/${repoName}/projects`, {
            name: projectName,
            body: `GitHub Project / Kanban board for Team ${group.name}`
        });

        // const project = await octokit.rest.projects.createForOrg({
        //     org: GITHUB_ORG,
        //     name: projectName,
        //     body: `GitHub Project / Kanban board for Team ${group.name}`,
        // });

        // for (const { student } of group.members) {
        //     await octokit.rest.projects.addCollaborator({
        //         project_id: project.data.id,
        //         username: student.githubUsername,
        //         permission: "write"
        //     });
        // }

        group.githubProjectId = project.data.id;
        await group.save();

        return console.log(`Successfully created ${projectName} and added all students!`);

    } catch (err) {
        console.error(`Could not create project for ${group.name}!`);
        console.error(err);
    }
}

async function checkTeam(teamSlug) {
    try {
        await octokit.rest.teams.getByName({
            org: GITHUB_ORG,
            team_slug: teamSlug
        });
        return true;
    } catch {
        return false;
    }
}