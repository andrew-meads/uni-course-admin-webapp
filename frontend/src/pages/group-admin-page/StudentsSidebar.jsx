import { useState } from "react";
import styles from "./StudentsSidebar.module.css";
import clsx from "clsx";
import { Form } from "react-bootstrap";
import StudentList from "../../components/group-admin-page/StudentList";
// import { useStudents } from "../../js/state/use-students";
import { useAuth } from "../../components/Auth";
import { useGroups } from "../../js/state/use-groups";

/**
 * Renders a collapsible sidebar allowing users to search for students.
 *
 * @param {{show: boolean}} props
 */
export default function StudentsSidebar({ show }) {
  const { token } = useAuth();
  const { students, getGroupForStudent } = useGroups(token);
  const [nameFilter, setNameFilter] = useState("");
  const [hideStudentsInGroups, setHideStudentsInGroups] = useState(false);

  const displayedStudents = students.map((s) => ({
    ...s,
    groupName: getGroupForStudent(s)?.name
  }));

  return (
    <div>
      <h2>Students</h2>
      <p>Search for students and drag them to groups.</p>
      <Form className="me-3">
        <Form.Group className="mb-1">
          <Form.Control
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Student name"
          />
        </Form.Group>
        <Form.Check
          id="switch-hide-grouped-students"
          type="switch"
          label={hideStudentsInGroups ? "Showing only ungrouped students" : "Showing all students"}
          checked={!hideStudentsInGroups}
          onChange={(e) => setHideStudentsInGroups(!e.target.checked)}
        />
      </Form>
      <div className={clsx(styles.studentListDiv, show ? styles.expand : styles.collapse)}>
        <StudentList
          students={displayedStudents}
          nameFilter={nameFilter}
          hideStudentsInGroups={hideStudentsInGroups}
        />
      </div>
    </div>
  );
}
