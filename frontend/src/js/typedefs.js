/**
 * @namespace typedefs
 *
 * @typedef {object} Student
 * @property {string} id
 * @property {string} name
 * @property {string|null} groupId
 *
 * @typedef {object} Group
 * @property {string} id
 * @property {string} name
 *
 * @typedef {object} StudentList
 * @property {Student[]} students
 *
 * @typedef {Group & StudentList} GroupWithStudents
 */
export {};
