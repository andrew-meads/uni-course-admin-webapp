import { Modal, Alert, Button } from "react-bootstrap";
import LoadingSpinner from "../../components/LoadingSpinner";
import FileUploadDragDrop from "../../components/FileUploadDragDrop";
import { useAuth } from "../../components/Auth";
import { useState } from "react";

/**
 * A modal dialog for handling uploading a student CSV.
 */
export default function UploadGradebookCSVModal({ show, onClose }) {
  const [file, setFile] = useState(null);
  const [isUploading, setUploading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [numNewStudents, setNumNewStudents] = useState(0);
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
    uploadStudentListCSV(form, token)
      .then((response) => {
        // console.log(response);
        setNumNewStudents(response.data.newStudents);
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
        <p>Drag & drop or click to upload a student gradebook CSV file.</p>
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
            File uploaded successfully! <strong>{numNewStudents}</strong> new students were added.
          </Alert>
        ) : undefined}
        {error ? (
          <Alert className="mt-2" variant="danger" dismissible onClose={() => setError(null)}>
            There was an error uploading the file. See browser console for details.
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
