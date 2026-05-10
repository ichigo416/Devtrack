import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

export const getMe = () => api.get("/auth/me");
export const logout = () => api.post("/auth/logout");
export const getRepos = (username: string) => api.get(`/api/github/${username}`);
export const getAnalytics = (username: string) => api.get(`/api/github/analytics/${username}`);
export const saveGoal = (username: string, goal: any) => api.post(`/api/github/goals/${username}`, goal);
export const getGoals = (username: string) => api.get(`/api/github/goals/${username}`);

// Squad APIs
export const createSquad = (name: string) => api.post("/api/squads/create", { name });
export const joinSquad = (code: string) => api.post("/api/squads/join", { code });
export const getMySquads = () => api.get("/api/squads/mine");
export const getSquadLeaderboard = (squadId: string) => api.get(`/api/squads/${squadId}/leaderboard`);