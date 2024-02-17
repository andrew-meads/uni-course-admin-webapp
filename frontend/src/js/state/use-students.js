import { signal, Signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

/** @type {Signal<import('../typedefs').Student[]>} */
const studentsSignal = signal([
  {
    id: "f6bf5fee-ea33-4c25-a45b-6245e9b55a76",
    name: "Luke Skywalker",
    groupId: "9b8c7a6d-5e4f-3h2i-1j0k-lmn0p123q456"
  },
  {
    id: "a1bcdef2-0034-46ab-b8ea-ba84ef2a8a11",
    name: "Leia Organa",
    groupId: null
  },
  {
    id: "b2c3d4e5-f6a7-8b9c-d0ef-12gh3i4jk567",
    name: "Han Solo",
    groupId: "9b8c7a6d-5e4f-3h2i-1j0k-lmn0p123q456"
  },
  {
    id: "adbc1234-56d7-890e-f12g-34h567i8k990",
    name: "Chewbacca",
    groupId: null
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    name: "Darth Vader",
    groupId: "5d6e7f8g-9a0b-1c2d-3e4f-g5h6i7j8k9l0"
  },
  {
    id: "a1234567-b89c-d0ef-gh12-i345jklmno67",
    name: "Yoda",
    groupId: "4f6e7d8c-9b0a-1b2c-3d4e-f5g6h7i8j9k0"
  },
  {
    id: "9a8b7c6d-5e4f-3g2h-1i0j-klmno123p456",
    name: "Obi-Wan Kenobi",
    groupId: "0p9o8n7m-6l5k-4j3i-2h1g-f0e1d2c3b4a5"
  },
  {
    id: "12345678-90ab-cdef-1234-567890abcdef",
    name: "Anakin Skywalker",
    groupId: "3a4b5c6d-7e8f-9g0h-1i2j-3k4l5m6n7o8p"
  },
  {
    id: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2g3h4i5j",
    name: "Padmé Amidala",
    groupId: "5d6e7f8g-9a0b-1c2d-3e4f-g5h6i7j8k9l0"
  },
  {
    id: "k1l2m3n4-o5p6-q7r8-s9t0-u1v2w3x4y5z6",
    name: "Boba Fett",
    groupId: "4f6e7d8c-9b0a-1b2c-3d4e-f5g6h7i8j9k0"
  }
]);

export function useStudents() {
  useSignals();

  /**
   * Update the given student
   * @param {import('../typedefs').Student} student the student to update
   */
  function updateStudent(student) {
    studentsSignal.value = studentsSignal.value.map((s) =>
      s.id === student.id ? { ...student } : s
    );
  }

  /**
   * Adds a new student
   * @param {import('../typedefs').Student} student the student to add
   */
  function addStudent(student) {
    studentsSignal.value = [...studentsSignal.value, student];
  }

  /**
   * Move a student to the given group
   *
   * @param {import('../typedefs').Student} student the student to move
   * @param {string} groupId the destination group is
   */
  function moveStudentToGroup(student, groupId) {
    updateStudent({ ...student, groupId });
  }

  /**
   * Removes a student from all groups
   *
   * @param {import('../typedefs').Student} student the student to move
   * @param {string} groupId the destination group is
   */
  function removeFromGroup(student) {
    student.groupId = null;
    updateStudent(student);
  }

  return {
    students: studentsSignal.value,
    updateStudent,
    addStudent,
    moveStudentToGroup,
    removeFromGroup
  };
}
