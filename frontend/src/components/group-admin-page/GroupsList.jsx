/**
 * @typedef {object} GroupsListProps
 * @property {import('../../js/typedefs').GroupWithStudents[]} groups
 * @property {string | undefined} nameFilter
 * @property {(group: import('../../js/typedefs').Group, student: import('../../js/typedefs').Student) => void} onStudentDropped
 * @property {(targetGroup: import('../../js/typedefs').Group, sourceGroup: import('../../js/typedefs').Group) => void} onGroupDropped
 * @property {(group: import('../../js/typedefs').Group) => void} onDeleteGroup
 */

import GroupCard from "./GroupCard";

/**
 * Displays a list of groups as a bunch of cards.
 *
 * @param {GroupsListProps} props
 */
export default function GroupsList({ groups, onStudentDropped, onGroupDropped, onDeleteGroup }) {
  return (
    <>
      {groups.map((g) => (
        <GroupCard
          key={g._id}
          group={g}
          onStudentDropped={onStudentDropped}
          onGroupDropped={onGroupDropped}
          onDelete={onDeleteGroup}
        />
      ))}
    </>
  );
}
