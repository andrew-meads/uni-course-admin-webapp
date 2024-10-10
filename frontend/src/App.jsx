import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import HomePage from "./pages/home-page/HomePage.jsx";
import GroupAdminPage from "./pages/group-admin-page/GroupAdminPage.jsx";
import LoginPage from "./pages/login-page/LoginPage.jsx";
import { RequiresAuth, RequiresNonAuth, RequiresRoles } from "./components/Auth.jsx";
import ProfilePage from "./pages/profile-page/ProfilePage.jsx";
import StudentAdminPage from "./pages/student-admin-page/StudentAdminPage.jsx";

function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={
            <RequiresAuth navigatePathWhenNotAuth="/login">
              <HomePage />
            </RequiresAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequiresAuth navigatePathWhenNotAuth="/login">
              <ProfilePage />
            </RequiresAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RequiresNonAuth>
              <LoginPage />
            </RequiresNonAuth>
          }
        />
        <Route
          path="/group-admin"
          element={
            <RequiresRoles roles={["admin"]} noAuthPath="/login" invalidRolesPath="/">
              <GroupAdminPage />
            </RequiresRoles>
          }
        />
        <Route
          path="/student-admin"
          element={
            <RequiresRoles roles={["admin"]} noAuthPath="/login" invalidRolesPath="/">
              <StudentAdminPage />
            </RequiresRoles>
          }
        />
      </Routes>
    </>
  );
}

export default App;
