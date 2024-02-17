import clsx from "clsx";
import { Card, ListGroup } from "react-bootstrap";

/**
 * Display basic user information
 */
export default function UserDetails({ user }) {
  return (
    <Card style={{ width: "max-content" }}>
      <ListGroup variant="flush">
        <ListGroup.Item>
          <span>
            <strong>Name: </strong>
          </span>
          <span>
            {user.firstName} {user.lastName}
          </span>
        </ListGroup.Item>
        <ListGroup.Item>
          <span>
            <strong>University ID: </strong>
          </span>
          <span>{user.uniId}</span>
        </ListGroup.Item>
        <ListGroup.Item>
          <span>
            <strong>Email address: </strong>
          </span>
          <span>{user.emailAddress}</span>
        </ListGroup.Item>
        <ListGroup.Item>
          <span>
            <strong>Role(s): </strong>
          </span>
          <span className="text-capitalize">{user.roles.join(", ")}</span>
        </ListGroup.Item>
        <ListGroup.Item>
          <span>
            <strong>GitHub username: </strong>
          </span>
          {user.githubUsername ? (
            <a href={`https://github.com/${user.githubUsername}`}>{user.githubUsername}</a>
          ) : (
            <span className="text-danger">Not provided!</span>
          )}
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
}
