import { useState } from "react";
import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";

import { login } from "../../js/api/apis";
import { useAuth } from "../../components/Auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    login(email, password)
      .then((res) => {
        setToken(res.data.token);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.log(err);
        setShowAlert(true);
      });
  }

  return (
    <>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <Card className="mt-5">
            <Card.Header>
              <Card.Title className="text-center">Login</Card.Title>
            </Card.Header>

            <Card.Body>
              <Form
                onSubmit={handleSubmit}
                className="d-flex flex-column mb-2"
                style={{ gap: "0.75rem" }}
              >
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Login
                  </Button>
                  {showAlert ? (
                    <Alert
                      className="mt-1"
                      variant="danger"
                      dismissible
                      onClose={() => setShowAlert(false)}
                    >
                      Could not log in with those credentials. Please try again.
                    </Alert>
                  ) : undefined}
                </Form.Group>
              </Form>
              <p className="text-secondary text-center">
                <em>
                  If you're a student, check your @aucklanduni.ac.nz email address for a one-time
                  password. You can change your password once you've logged in.
                </em>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
