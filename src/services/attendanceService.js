import api from "./api";

// Self-service
export const getMyAttendanceStatus = () => api.get("/attendance/my-status");
export const checkIn = (data = {}) => api.post("/attendance/check-in", data);
export const checkOut = (data = {}) => api.post("/attendance/check-out", data);
export const startBreak = (data = {}) => api.post("/attendance/break/start", data);
export const endBreak = (data = {}) => api.post("/attendance/break/end", data);

// Management
export const getTodayAttendance = () => api.get("/attendance/today");
export const getAttendanceHistory = (params) => api.get("/attendance/history", { params });
export const getAttendanceSummary = (params) => api.get("/attendance/summary", { params });
export const markAttendance = (data) => api.post("/attendance/mark", data);
