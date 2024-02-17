import { useState } from "react";
import { Accordion, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UploadGradebookCSVModal from "./UploadGradebookCSVModal";

export default function AdminActionsSection() {
  const navigate = useNavigate();
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  return (
    <>
      <Accordion.Item eventKey="actions">
        <Accordion.Header>
          <strong>My actions</strong>
        </Accordion.Header>
        <Accordion.Body>
          <ListGroup variant="flush">
            <ListGroup.Item action onClick={() => navigate("/group-admin")}>
              Group administration
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => setShowCsvUpload(true)}>
              Upload student gradebook CSV
            </ListGroup.Item>
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>

      {/* Modal for uploading CSV file */}
      <UploadGradebookCSVModal show={showCsvUpload} onClose={() => setShowCsvUpload(false)} />
    </>
  );
}
