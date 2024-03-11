import { ListGroup } from "react-bootstrap";
import StudentListItem from "./StudentListItem";

/**
 * @typedef {object} StudentListProps
 * @property {import('../../js/typedefs').Student[]} students
 * @property {string | undefined} nameFilter
 * @property {boolean | undefined} hideStudentsInGroups
 */

/**
 * Render a list of students
 *
 * @param {StudentListProps} props
 * @returns
 */
export default function StudentList({ students, nameFilter, hideStudentsInGroups }) {
  const displayedStudents = students.filter((s) =>
    studentFilter(s, nameFilter, hideStudentsInGroups)
  );

  return (
    <ListGroup as="ul">
      {displayedStudents.map((s) => (
        <StudentListItem key={s._id} student={s} />
      ))}
    </ListGroup>
  );
}

/**
 * Returns a boolean indicating whether the given student should be shown, based on the filters.
 *
 * @param {import('../../js/state/typedefs').Student} student the student
 * @param {string} nameFilter if defined, filters by student name
 * @param {boolean} hideStudentsInGroups if true, filters out students who are in groups
 */
function studentFilter(student, nameFilter, hideStudentsInGroups) {
  const name = student.firstName + " " + student.lastName;
  return (
    (!(nameFilter && nameFilter !== "") || name.toLowerCase().includes(nameFilter.toLowerCase())) &&
    (!hideStudentsInGroups || !!!student.groupName)
  );
}
