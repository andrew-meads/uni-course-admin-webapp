import { Accordion } from "react-bootstrap";
import UserDetails from "../../components/profile-page/UserDetails";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function UserInfoSection({ user }) {
  return (
    <Accordion.Item as="section" eventKey="0">
      <Accordion.Header>
        <h2>Your information</h2>
      </Accordion.Header>
      <Accordion.Body>{user ? <UserDetails user={user} /> : <LoadingSpinner />}</Accordion.Body>
    </Accordion.Item>
  );
}
