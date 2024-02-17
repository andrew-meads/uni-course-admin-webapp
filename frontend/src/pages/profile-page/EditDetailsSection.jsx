import { Accordion, Button, Form, Row, Col, FloatingLabel, Alert } from "react-bootstrap";
import { useState } from "react";
import { useAuth } from "../../components/Auth";
import { updateGithubUsername, updatePassword } from "../../js/api/apis";
import { useDialog } from "../../components/DialogProvider";

export default function EditDetailsSection({ user, onDetailsUpdated }) {
  return (
    <Accordion.Item as="section" eventKey="1">
      <Accordion.Header>
        <h2>Edit your details</h2>
      </Accordion.Header>
      <Accordion.Body>
        <p>You can edit your GitHub username and / or your password here.</p>
        <hr />
        {user ? (
          <div>
            <GitHubUsernameForm
              initialUsername={user.githubUsername ?? ""}
              onDetailsUpdated={onDetailsUpdated}
            />
            <hr />
            <PasswordForm onDetailsUpdated={onDetailsUpdated} />
          </div>
        ) : undefined}
      </Accordion.Body>
    </Accordion.Item>
  );
}

function GitHubUsernameForm({ initialUsername, onDetailsUpdated }) {
  const [username, setUsername] = useState(initialUsername);
  const [success, setSuccess] = useState(false);
  const [fail, setFail] = useState(false);
  const { token } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();
    if (username === initialUsername) return;

    setSuccess(false);
    setFail(false);

    updateGithubUsername(username, token)
      .then((res) => {
        setUsername(res.data.githubUsername);
        setSuccess(true);
        onDetailsUpdated();
      })
      .catch((err) => {
        setFail(true);
      });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>GitHub username:</Form.Label>
        <Form.Control
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mt-2 d-flex flex-row justify-content-end">
        <Button type="submit">Update</Button>
      </Form.Group>
      {success ? (
        <Alert className="mt-2" variant="success" dismissible onClose={() => setSuccess(false)}>
          GitHub username updated successfully!
        </Alert>
      ) : fail ? (
        <Alert className="mt-2" variant="danger" dismissible onClose={() => setFail(false)}>
          Could not update GitHub username, please try again!
        </Alert>
      ) : undefined}
    </Form>
  );
}

function PasswordForm({ onDetailsUpdated }) {
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [success, setSuccess] = useState(false);
  const [fail, setFail] = useState(false);
  const { token } = useAuth();
  const showDialog = useDialog();

  function handleSubmit(e) {
    e.preventDefault();

    if (password1 !== password2)
      return showDialog({
        title: "Password mismatch",
        content: "The two password fields must match."
      });

    setSuccess(false);
    setFail(false);

    updatePassword(password1, token)
      .then((res) => {
        setSuccess(true);
        onDetailsUpdated();
      })
      .catch((err) => {
        setFail(true);
      });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Password:</Form.Label>
        <Form.Control
          type="password"
          required
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mt-2">
        <Form.Label>Confirm password:</Form.Label>
        <Form.Control
          type="password"
          required
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
      </Form.Group>
      <Form.Group
        className="mt-2 d-flex flex-row-reverse align-items-center"
        style={{ gap: "0.5rem" }}
      >
        <Button type="submit">Update</Button>
        {password2.length > 0 && password1 !== password2 ? (
          <span className="text-danger">Passwords must match!</span>
        ) : undefined}
      </Form.Group>
      {success ? (
        <Alert className="mt-2" variant="success" dismissible onClose={() => setSuccess(false)}>
          Password updated successfully!
        </Alert>
      ) : fail ? (
        <Alert className="mt-2" variant="danger" dismissible onClose={() => setFail(false)}>
          Could not update password, please try again!
        </Alert>
      ) : undefined}
    </Form>
  );
}
