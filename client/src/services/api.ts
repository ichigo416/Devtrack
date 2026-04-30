import axios from "axios";

const BASE_URL = "http://localhost:5000/api/github";

// ✅ Get repos
export const getRepos = (username: string) => {
  return axios.get(`${BASE_URL}/${username}`);
};

// ✅ Get analytics
export const getAnalytics = (username: string) => {
  return axios.get(`${BASE_URL}/analytics/${username}`);
};