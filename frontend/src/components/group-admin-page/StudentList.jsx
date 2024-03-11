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
export default function StudentList({ students }) {
  return (
    <ListGroup as="ul">
      {students.map((s) => (
        <StudentListItem key={s._id} student={s} />
      ))}
    </ListGroup>
  );
}
