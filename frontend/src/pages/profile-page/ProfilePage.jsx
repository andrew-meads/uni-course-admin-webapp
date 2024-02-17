import { Accordion } from "react-bootstrap";
import { useApiUser } from "../../js/api/apis";
import EditDetailsSection from "./EditDetailsSection";
import UserInfoSection from "./UserInfoSection";
import GitHubUsernameSection from "../shared/GitHubUsernameSection";

export default function ProfilePage() {
  const { data: apiUser, refresh: refreshUser } = useApiUser();

  return (
    <main>
      <h1>Your profile</h1>
      <p>
        Please double check the information below. If any of this is incorrect, please{" "}
        <a href="mailto:andrew.meads@auckland.ac.nz">contact your course coordinator</a> ASAP!
      </p>

      {apiUser && !apiUser.githubUsername ? (
        <GitHubUsernameSection onUsernameChanged={refreshUser} />
      ) : undefined}

      <Accordion defaultActiveKey="0" flush>
        <UserInfoSection user={apiUser} />

        <EditDetailsSection user={apiUser} onDetailsUpdated={refreshUser} />
      </Accordion>
    </main>
  );
}
