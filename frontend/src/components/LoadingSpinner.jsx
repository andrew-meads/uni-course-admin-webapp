import { Spinner } from "react-bootstrap";

/**
 * Displayed if some info isn't loaded yet.
 */
export default function LoadingSpinner({ text }) {
  return (
    <div className="d-flex flex-row align-items-center" style={{ gap: "0.5rem" }}>
      <Spinner animation="border" variant="primary" />
      <span className="text-secondary">{text ?? "Loading..."}</span>
    </div>
  );
}
