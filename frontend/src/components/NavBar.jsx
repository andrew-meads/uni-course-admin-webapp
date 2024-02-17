import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useAuth, useRoleCheck } from "./Auth";
import { logout } from "../js/api/apis";
import { useDialog } from "./DialogProvider";

export default function NavBar() {
  const { isAuthenticated, token, clearAndNavigate } = useAuth();
  const roleCheck = useRoleCheck();
  const showDialog = useDialog();

  function handleLogout() {
    logout(token)
      .then(() => {
        clearAndNavigate("/login");
      })
      .catch((err) => {
        console.log(err);
        showDialog({
          title: "Logout error",
          content: "Error logging out! Check the browser console."
        });
      });
  }

  return (
    <Navbar expand="md" bg="primary" data-bs-theme="dark" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand>The App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated ? (
              <Nav.Link as={NavLink} to="/">
                Home
              </Nav.Link>
            ) : undefined}
            {isAuthenticated ? (
              <Nav.Link as={NavLink} to="/profile">
                My Profile
              </Nav.Link>
            ) : undefined}
            {roleCheck("admin") ? (
              <Nav.Link as={NavLink} to="/group-admin">
                Group admin
              </Nav.Link>
            ) : undefined}
            {roleCheck("admin") ? (
              <Nav.Link as={NavLink} to="/student-admin">
                Student admin
              </Nav.Link>
            ) : undefined}
          </Nav>
        </Navbar.Collapse>
        <Nav>
          {isAuthenticated ? (
            <Nav.Link as={Button} variant="link" onClick={handleLogout}>
              Logout
            </Nav.Link>
          ) : (
            <Nav.Link as={NavLink} to="/login">
              Login
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
