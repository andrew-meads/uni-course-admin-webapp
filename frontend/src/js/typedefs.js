/**
 * @namespace typedefs
 *
 * @typedef {object} Student
 * @property {string} _id
 * @property {number} uniId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} emailAddress
 * @property {string} githubUsername
 *
 * @typedef {object} GroupMemberRecord
 * @property {string} student
 * @property {boolean} isGithubInviteSent
 * @property {string} _id
 *
 * @typedef {object} Group
 * @property {string} _id
 * @property {string} name
 * @property {boolean} isTempName
 * @property {string | null} githubUrl
 * @property {boolean} initialEmailSent
 * @property {boolean} reviewersEmailSent
 * @property {string} initialQuestions
 * @property {string} initialIdeas
 * @property {string} notes
 * @property {string | null} presentationDate
 * @property {GroupMemberRecord[]} members
 * @property {String | undefined} imageUrl
 *
 */
export {};
