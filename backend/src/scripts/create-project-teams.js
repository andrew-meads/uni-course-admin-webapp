import { withDatabase } from "./util.js";
import { octokit } from "../external-apis/github.js";
import { GITHUB_ORG } from "../env.js";
import { ProjectGroup, User } from "../data/schema.js";

await withDatabase(async () => {

    await createAllStudentsTeam();

    let counter = 0;
    const groups = await ProjectGroup.find({}).populate("members.student");
    for (const group of groups) {
        await createGroupTeam(group);
        counter++;

        // if (counter === 1) break;
    }

    console.log(`${counter} groups processed.`);

});

async function createAllStudentsTeam() {

    const teamName = "Full-Time Students";
    const teamSlug = "full-time-students";

    try {

        await octokit.rest.teams.getByName({
            org: GITHUB_ORG,
            team_slug: teamSlug
        });

        return console.log(`${teamName} is already created!`);

    } catch (err) {
        if (err.status !== 404) throw err;

        const students = await User.find({ roles: ["student"] });
        // console.log(students);

        await octokit.rest.teams.create({
            org: GITHUB_ORG,
            name: teamName,
            description: `All PGCIT full-time students, 2024 S2`,
            privacy: "closed"
        });

        console.log(`Created ${teamName}!`);

        for (const student of students) {
            try {
                await addStudentToStudentsTeam(student, teamName, teamSlug);
            } catch (err) {
                console.error(
                    `Could not add ${memberRecord.student.firstName} ${memberRecord.student.lastName} to ${teamName}!`
                );
                console.error(err);
            }
        }
    }
}

async function addStudentToStudentsTeam(student, teamName, teamSlug) {
    const studentName = `${student.firstName} ${student.lastName}`;

    if (student.isStudentsTeamInviteSent)
        return console.log(`${studentName} has already been invited to ${teamName}.`);

    if (!student.githubUsername)
        return console.log(`${studentName} has not provided their GitHub username!`);

    console.log(`Adding ${studentName} to ${teamName}...`);

    await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
        org: GITHUB_ORG,
        team_slug: teamSlug,
        username: student.githubUsername
    });

    console.log("Done!");

    student.isStudentsTeamInviteSent = true;
    await student.save();
}

async function createGroupTeam(group) {

    const teamName = `Team ${group.name} (Full-Time)`;
    const teamSlug = `team-${group.name.toLowerCase().replaceAll(" ", "-")}-full-time`;

    try {

        await octokit.rest.teams.getByName({
            org: GITHUB_ORG,
            team_slug: teamSlug
        });

        return console.log(`${teamName} is already created!`);

    } catch (err) {
        if (err.status !== 404) throw err;

        await octokit.rest.teams.create({
            org: GITHUB_ORG,
            name: teamName,
            description: `Project team for Full-time PGCert group ${group.name}`,
            privacy: "closed"
        });

        console.log(`Created ${teamName}!`);

        for (const memberRecord of group.members) {
            try {
                await addGroupMemberToTeam(group, teamName, teamSlug, memberRecord);
            } catch (err) {
                console.error(
                    `Could not add member ${memberRecord.student.firstName} ${memberRecord.student.lastName} to ${teamName}!`
                );
                console.error(err);
            }
        }
    }
}

async function addGroupMemberToTeam(group, teamName, teamSlug, memberRecord) {
    const { student, isTeamInviteSent } = memberRecord;
    const studentName = `${student.firstName} ${student.lastName}`;

    if (isTeamInviteSent)
        return console.log(`${studentName} has already been invited to ${teamName}.`);

    if (!student.githubUsername)
        return console.log(`${studentName} has not provided their GitHub username!`);

    console.log(`Adding ${studentName} to ${teamName}...`);

    await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
        org: GITHUB_ORG,
        team_slug: teamSlug,
        username: student.githubUsername
    });

    console.log("Done!");

    memberRecord.isTeamInviteSent = true;
    await group.save();
}