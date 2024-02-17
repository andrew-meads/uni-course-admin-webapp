import { signal, Signal } from "@preact/signals-react";
import { useStudents } from "./use-students";
import { v4 as uuid } from "uuid";

/** @type {Signal<import('../typedefs').Group[]>} */
const groupsSignal = signal([
  { id: "9b8c7a6d-5e4f-3h2i-1j0k-lmn0p123q456", name: "Agile Antelope" },
  { id: "4f6e7d8c-9b0a-1b2c-3d4e-f5g6h7i8j9k0", name: "Brave Bison" },
  { id: "3a4b5c6d-7e8f-9g0h-1i2j-3k4l5m6n7o8p", name: "Cunning Cobra" },
  { id: "5d6e7f8g-9a0b-1c2d-3e4f-g5h6i7j8k9l0", name: "Diligent Duck" },
  { id: "0p9o8n7m-6l5k-4j3i-2h1g-f0e1d2c3b4a5", name: "Energetic Elephant" }
]);

export function useGroups() {
  const { students, moveStudentToGroup, removeFromGroup } = useStudents();

  const groupsWithStudents = groupsSignal.value.map((g) => ({
    ...g,
    students: students.filter((s) => s.groupId === g.id)
  }));

  /**
   * Deletes a group.
   *
   * @param {import('../typedefs').Group} group
   */
  function deleteGroup(group, removeStudentsFirst = true) {
    if (removeStudentsFirst) {
      const toRemove = students.filter((s) => s.groupId === group.id);
      toRemove.forEach((s) => removeFromGroup(s));
    }

    groupsSignal.value = groupsSignal.value.filter((g) => g.id !== group.id);
  }

  /**
   * Moves all students in the source group into the target group,
   * then deletes the source group.
   *
   * @param {import('../typedefs').Group} targetGroup
   * @param {import('../typedefs').GroupWithStudents} sourceGroup
   */
  function mergeGroups(targetGroup, sourceGroup) {
    const students = [...sourceGroup.students];
    students.forEach((s) => moveStudentToGroup(s, targetGroup.id));
    deleteGroup(sourceGroup, false);
  }

  /**
   * Creates a new group
   * @param {string} name the name of the new group
   */
  function createNewGroup(name) {
    groupsSignal.value = [...groupsSignal.value, { id: uuid(), name }];
  }

  return {
    groups: groupsSignal.value,
    groupsWithStudents,
    mergeGroups,
    deleteGroup,
    createNewGroup
  };
}
