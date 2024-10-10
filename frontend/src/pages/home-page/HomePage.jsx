import { Accordion, Container } from "react-bootstrap";
import { useUser } from "../../components/Auth";
import { useApiUser } from "../../js/api/apis";
import GitHubUsernameSection from "../shared/GitHubUsernameSection";
import AdminActionsSection from "./AdminActionsSection";

export default function HomePage() {
  const authUser = useUser();

  const { data: apiUser, refresh: refreshUser } = useApiUser();

  return (
    <Container as={"main"} className="mt-2">

      <h1>Hi {authUser.firstName}!</h1>
      <p>This is your homepage.</p>

      {apiUser && !apiUser.githubUsername ? (
        <GitHubUsernameSection onUsernameChanged={refreshUser} />
      ) : undefined}

      <Accordion defaultActiveKey="actions">
        {authUser.roles.includes("admin") ? <AdminActionsSection /> : undefined}
      </Accordion>

    </Container>
  );
}
