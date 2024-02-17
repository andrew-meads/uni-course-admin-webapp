import { useState } from "react";
import { Alert, Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { useAuth } from "../../components/Auth";
import { updateGithubUsername } from "../../js/api/apis";
import { useDialog } from "../../components/DialogProvider";

export default function GitHubUsernameSection({ onUsernameChanged }) {
  const { token } = useAuth();
  const [username, setUsername] = useState("");
  const showDialog = useDialog();

  function handleSubmit(e) {
    e.preventDefault();

    updateGithubUsername(username, token)
      .then((res) => {
        setUsername(res.data.githubUsername);
        showDialog({
          title: "Success!",
          content: `GitHub username "${res.data.githubUsername}" set successfully!`
        });
        onUsernameChanged(res.data.githubUsername);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404)
          return showDialog({
            title: "Invalid GitHub username",
            content: `The username ${username} was not found!`
          });

        return showDialog({
          title: "Error",
          content: "There was an error sending the request. Please try again later."
        });
      });
  }

  return (
    <section>
      <Alert variant="warning">
        <Alert.Heading>❗Important: Provide your GitHub username!</Alert.Heading>
        <p>
          It's <strong>really important</strong> that you provide use your GitHub username. Without
          it, we can't add you to all the project & assignment repos this semester!
        </p>
        <hr />
        <p>Please use this form below to provide your details.</p>
        <Form onSubmit={handleSubmit}>
          <Row className="align-items-center">
            <Form.Group as={Col}>
              <FloatingLabel controlId="floatingInput" label="GitHub username">
                <Form.Control
                  type="text"
                  placeholder="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group as={Col} xs="auto">
              <Button type="submit">Check</Button>
            </Form.Group>
          </Row>
        </Form>
      </Alert>
    </section>
  );
}
