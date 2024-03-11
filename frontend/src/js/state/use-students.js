import { signal, Signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import axios from "axios";
import { useEffect } from "react";
import { USERS_URL } from "../api/urls";
import { authHeader } from "../api/apis";

/** @type {Signal<import('../typedefs').Student[]>} */
const studentsSignal = signal([]);

export function useStudents(token) {
  useSignals();

  // Load initial students from API
  useEffect(() => {
    if (studentsSignal.value.length > 0) return;
    axios
      .get(`${USERS_URL}?role=student`, authHeader(token))
      .then((response) => (studentsSignal.value = response.data));
  }, []);

  return { students: studentsSignal.value };

  // /**
  //  * Update the given student
  //  * @param {import('../typedefs').Student} student the student to update
  //  */
  // function updateStudent(student) {
  //   studentsSignal.value = studentsSignal.value.map((s) =>
  //     s.id === student.id ? { ...student } : s
  //   );
  // }

  // /**
  //  * Adds a new student
  //  * @param {import('../typedefs').Student} student the student to add
  //  */
  // function addStudent(student) {
  //   studentsSignal.value = [...studentsSignal.value, student];
  // }

  // /**
  //  * Move a student to the given group
  //  *
  //  * @param {import('../typedefs').Student} student the student to move
  //  * @param {string} groupId the destination group is
  //  */
  // function moveStudentToGroup(student, groupId) {
  //   updateStudent({ ...student, groupId });
  // }

  // /**
  //  * Removes a student from all groups
  //  *
  //  * @param {import('../typedefs').Student} student the student to move
  //  * @param {string} groupId the destination group is
  //  */
  // function removeFromGroup(student) {
  //   student.groupId = null;
  //   updateStudent(student);
  // }

  // return {
  //   students: studentsSignal.value,
  //   updateStudent,
  //   addStudent,
  //   moveStudentToGroup,
  //   removeFromGroup
  // };
}
