import { Modal, Alert, Button } from "react-bootstrap";
import LoadingSpinner from "../../components/LoadingSpinner";
import FileUploadDragDrop from "../../components/FileUploadDragDrop";
import { useAuth } from "../../components/Auth";
import { useState } from "react";
import { uploadProjectGroupSignupCSV } from "../../js/api/apis";

/**
 * A modal dialog for handling uploading the proejct group signup CSV.
 */
export default function UploadProjectGroupsCSVModal({ show, onClose }) {
  const [file, setFile] = useState(null);
  const [isUploading, setUploading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [numNewGroups, setNumNewGroups] = useState(0);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  /**
   * Handles the actual file upload. Prepares the FormData and POSTs it. Upon receiving a
   * response, displays either a success or error message.
   */
  function handleUpload() {
    setUploading(true);
    setSuccess(false);
    setError(null);

    const form = new FormData();
    form.append("file", file);
    uploadProjectGroupSignupCSV(form, token)
      .then((response) => {
        setSuccess(true);
        setUploading(false);
        setNumNewGroups(response.data.newGroups);
        setFile(null);
      })
      .catch((error) => {
        const data = error.response?.data;
        console.error(data ?? error);
        setError(data ?? ["Unknown error - check browser console!"]);
        setUploading(false);
      });
  }

  /**
   * Handles closing this dialog box. Resets values so the next time we show, it will be set to default.
   */
  function handleClose() {
    setFile(null);
    setSuccess(false);
    setError(null);
    onClose();
  }

  return (
    <Modal show={show} onHide={handleClose} backdrop={isUploading ? "static" : undefined}>
      <Modal.Header closeButton>
        <Modal.Title>Upload CSV file</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Drag & drop box for allowing CSV upload */}
        <p>Drag & drop or click to upload a project signup CSV file.</p>
        <FileUploadDragDrop mimeType={"text/csv"} onFilesDropped={(f) => setFile(f[0])}>
          {file ? <span>{file.name}</span> : undefined}
        </FileUploadDragDrop>

        {/* Alerts for uploading / success / error conditions */}
        {isUploading ? (
          <Alert className="mt-2" variant="info">
            <LoadingSpinner>Uploading...</LoadingSpinner>
          </Alert>
        ) : undefined}
        {isSuccess ? (
          <Alert className="mt-2" variant="success" dismissible onClose={() => setSuccess(false)}>
            File uploaded successfully! {numNewGroups} groups were added.
          </Alert>
        ) : undefined}
        {error ? (
          <Alert className="mt-2" variant="danger" dismissible onClose={() => setError(null)}>
            There were some errors with the uploaded file:
            <ul>
              {error.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </Alert>
        ) : undefined}
      </Modal.Body>

      {/* Close / upload buttons */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleUpload} disabled={!file || isUploading}>
          Upload
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
