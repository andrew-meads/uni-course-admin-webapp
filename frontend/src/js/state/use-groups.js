import { signal, Signal } from "@preact/signals-react";
import { useStudents } from "./use-students";
import { v4 as uuid } from "uuid";
import {
  authHeader,
  updateStudentGroup,
  createGroup as apiCreateGroup,
  mergeGroups as apiMergeGroups,
  deleteGroup as apiDeleteGroup
} from "../api/apis";
import { useEffect } from "react";
import axios from "axios";
import { GROUPS_URL } from "../api/urls";

/** @type {Signal<import('../typedefs').Group[]>} */
const groupsSignal = signal([]);

export function useGroups(token) {
  const { students } = useStudents(token);

  // Load initial groups from API
  useEffect(() => {
    if (groupsSignal.value.length > 0) return;
    axios
      .get(GROUPS_URL, authHeader(token))
      .then((response) => (groupsSignal.value = response.data));
  }, []);

  /**
   * Gets all students in the given groups
   *
   * @param {import('../typedefs').Group} group
   */
  function getStudentsInGroup(group) {
    const memberIds = group.members.map((m) => m.student);
    return students.filter((s) => memberIds.includes(s._id));
  }

  /**
   * Gets the group for a student, if any
   *
   * @param {import('../typedefs').Student} student
   */
  function getGroupForStudent(student) {
    return groupsSignal.value.find((g) => g.members.map((m) => m.student).includes(student._id));
  }

  /**
   * Deletes a group.
   *
   * @param {import('../typedefs').Group} group
   */
  function deleteGroup(group, makeApiRequest = true, token) {
    const oldGroups = groupsSignal.value;
    groupsSignal.value = groupsSignal.value.filter((g) => g._id !== group._id);

    // Do API request if required, and rollback if fail
    if (!makeApiRequest) return;
    apiDeleteGroup(group._id, token)
      .then(() => console.log("API request to delete group successful"))
      .catch((err) => {
        console.log(err);
        groupsSignal.value = oldGroups;
      });
  }

  /**
   * Moves a student to another group
   *
   * @param {import('../typedefs').Student} student
   * @param {import('../typedefs').Group} targetGroup
   * @param {string} token the auth token
   */
  function moveStudentToGroup(student, targetGroup, token) {
    const oldGroup = getGroupForStudent(student);
    let memberRecord = oldGroup?.members?.find((m) => m.student === student._id);
    if (!memberRecord)
      memberRecord = { _id: uuid(), student: student._id, isGithubInviteSent: false };

    const oldGroups = groupsSignal.value;

    groupsSignal.value = groupsSignal.value.map((group) => {
      if (group !== targetGroup && group !== oldGroup) return group;
      if (group === targetGroup)
        return { ...targetGroup, members: [...targetGroup.members, memberRecord] };
      if (group === oldGroup)
        return { ...oldGroup, members: oldGroup.members.filter((m) => m._id !== memberRecord._id) };
    });

    // Do the API request, rollback if fail.
    updateStudentGroup(student._id, targetGroup._id, token)
      .then(() => console.log("API request to move student was successful!"))
      .catch((err) => {
        console.log(err);
        groupsSignal.value = oldGroups; // Rollback
      });
  }

  /**
   * Moves all students in the source group into the target group,
   * then deletes the source group.
   *
   * @param {import('../typedefs').Group} targetGroup
   * @param {import('../typedefs').Group} sourceGroup
   */
  function mergeGroups(targetGroup, sourceGroup, token) {
    const sourceMembers = sourceGroup.members;
    const oldGroups = groupsSignal.value;
    groupsSignal.value = groupsSignal.value.map((oldGroup) => {
      if (oldGroup !== targetGroup) return oldGroup;
      return { ...targetGroup, members: [...targetGroup.members, ...sourceMembers] };
    });
    deleteGroup(sourceGroup, false);

    // Do API request then rollback if fail
    apiMergeGroups(sourceGroup._id, targetGroup._id, token)
      .then(() => console.log("API request to merge groups successful"))
      .catch((err) => {
        console.log(err);
        groupsSignal.value = oldGroups;
      });
  }

  /**
   * Creates a new group
   * @param {string} name the name of the new group
   */
  function createNewGroup(name, token) {
    const oldGroups = groupsSignal.value;

    const newGroup = {
      _id: uuid(),
      name,
      members: [],
      isTempName: false,
      githubUrl: null,
      initialEmailSent: false,
      reviewersEmailSent: false,
      initialQuestions: "",
      initialIdeas: "",
      notes: "",
      presentationDate: null,
      reviewers: []
    };

    groupsSignal.value = [...groupsSignal.value, newGroup];

    // Do API request, rollback if fail, update group id if success.
    apiCreateGroup(newGroup, token)
      .then((response) => {
        console.log("API request to create group successful!");
        groupsSignal.value = [...oldGroups, { ...newGroup, _id: response.data._id }];
      })
      .catch((err) => {
        console.log(err);
        groupsSignal.value = oldGroups;
      });
  }

  return {
    students,
    groups: groupsSignal.value,
    getStudentsInGroup,
    getGroupForStudent,
    createNewGroup,
    mergeGroups,
    deleteGroup,
    moveStudentToGroup
  };
}
