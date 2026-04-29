import axios from "axios";

export const getRepos = (username: string) => {
  return axios.get(`http://localhost:5000/api/github/${username}`);
};