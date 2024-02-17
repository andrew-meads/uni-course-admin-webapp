import React from "react";
import { useState } from "react";
import { Col, Collapse, Form, Row } from "react-bootstrap";
import clsx from "clsx";
import styles from "./GroupAdminPage.module.css";
import StudentsSidebar from "./StudentsSidebar";
import GroupAdminMain from "./GroupAdminMain";

export default function GroupAdminPage() {
  const [showStudents, setShowStudents] = useState(true);

  return (
    <>
      <h1>Group Admin</h1>
      <Form>
        <Row>
          <Col xs="auto">
            Manage your groups here. Switch the following to show / hide students:
          </Col>
          <Col>
            <Form.Check
              className="text-secondary"
              id="show-students-switch"
              type="switch"
              label={`Currently ${showStudents ? "showing" : "hiding"} students`}
              checked={showStudents}
              onChange={(e) => setShowStudents(e.target.checked)}
            />
          </Col>
        </Row>
      </Form>

      <div className={clsx(styles.mainGrid)}>
        <Collapse in={showStudents} dimension={"width"}>
          <aside>
            <StudentsSidebar show={showStudents} />
          </aside>
        </Collapse>

        <main>
          <GroupAdminMain />
        </main>
      </div>
    </>
  );
}
