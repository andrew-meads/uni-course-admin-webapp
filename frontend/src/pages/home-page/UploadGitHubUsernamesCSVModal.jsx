import { Modal, Alert, Button } from "react-bootstrap";
import LoadingSpinner from "../../components/LoadingSpinner";
import FileUploadDragDrop from "../../components/FileUploadDragDrop";
import { useAuth } from "../../components/Auth";
import { useState } from "react";
import { uploadGitHubUsernamesCSV } from "../../js/api/apis";

/**
 * A modal dialog for handling uploading the GitHub Usernames CSV.
 */
export default function UploadGitHubUsernamesCSVModal({ show, onClose }) {
  const [file, setFile] = useState(null);
  const [isUploading, setUploading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
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
    uploadGitHubUsernamesCSV(form, token)
      .then((response) => {
        const errors = response.data;
        if (errors && errors.length > 0) {
          console.error(errors);
          setError(errors);
        }
        setSuccess(true);
        setUploading(false);
        setFile(null);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
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
        <p>Drag & drop or click to upload a GitHub usernames CSV file.</p>
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
            File uploaded successfully!
          </Alert>
        ) : undefined}
        {error ? (
          <Alert className="mt-2" variant="danger" dismissible onClose={() => setError(null)}>
            There were some errors with the uploaded file. Please see the console for details.
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
