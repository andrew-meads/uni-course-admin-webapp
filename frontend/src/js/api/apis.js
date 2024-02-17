import axios from "axios";
import { AUTH_URL, GH_URL, USERS_URL, UPLOADS_URL } from "./urls";
import useGet from "../hooks/useGet";

export const login = (email, password) => axios.post(AUTH_URL, { email, password });

export const logout = (token) => axios.delete(AUTH_URL, authHeader(token));

// export const githubVerify = (username) => axios.post(`${GH_URL}/verify`, { username });

export const useApiUser = () => useGet(`${USERS_URL}/me`, { requiresAuth: true });

export const updateGithubUsername = (username, token) =>
  axios.patch(`${USERS_URL}/me/github-username`, { githubUsername: username }, authHeader(token));

export const updatePassword = (password, token) =>
  axios.patch(`${USERS_URL}/me/password`, { password }, authHeader(token));

export const useGetStudents = () => useGet(`${USERS_URL}?role=student`, { requiresAuth: true });

export const uploadStudentListCSV = (formData, token) =>
  axios.post(`${UPLOADS_URL}/student-list`, formData, authHeader(token));

export const uploadGitHubUsernamesCSV = (formData, token) =>
  axios.post(`${UPLOADS_URL}/github-usernames`, formData, authHeader(token));

export const uploadProjectGroupSignupCSV = (formData, token) =>
  axios.post(`${UPLOADS_URL}/project-signup`, formData, authHeader(token));

const authHeader = (token) => ({
  headers: {
    authorization: `Bearer ${token}`
  }
});
