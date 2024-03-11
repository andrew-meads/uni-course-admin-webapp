import { useState } from "react";
import { Accordion, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UploadGradebookCSVModal from "./UploadGradebookCSVModal";
import UploadGitHubUsernamesCSVModal from "./UploadGitHubUsernamesCSVModal";
import UploadProjectGroupsCSVModal from "./UploadProjectGroupsCSVModal";

export default function AdminActionsSection() {
  const navigate = useNavigate();
  const [showGradebookUpload, setShowGradebookUpload] = useState(false);
  const [showGitHubUsernameUpload, setShowGitHubUsernameUpload] = useState(false);
  const [showProjectSignupUpload, setShowProjectSignupUpload] = useState(false);

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
            <ListGroup.Item action onClick={() => setShowGradebookUpload(true)}>
              Upload student gradebook CSV
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => setShowGitHubUsernameUpload(true)}>
              Upload GitHub usernames CSV
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => setShowProjectSignupUpload(true)}>
              Upload project signup CSV
            </ListGroup.Item>
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>

      {/* Modals */}
      <UploadGradebookCSVModal
        show={showGradebookUpload}
        onClose={() => setShowGradebookUpload(false)}
      />
      <UploadGitHubUsernamesCSVModal
        show={showGitHubUsernameUpload}
        onClose={() => setShowGitHubUsernameUpload(false)}
      />
      <UploadProjectGroupsCSVModal
        show={showProjectSignupUpload}
        onClose={() => setShowProjectSignupUpload(false)}
      />
    </>
  );
}
