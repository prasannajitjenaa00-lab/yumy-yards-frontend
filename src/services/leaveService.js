import api from "./api";

// ── Employee Self-Service ──
export const getMyLeaves = (params) => api.get("/leaves/my", { params });
export const getMyLeaveBalances = () => api.get("/leaves/my-balances");
export const applyLeave = (data) => api.post("/leaves", data);
export const cancelMyLeave = (id) => api.patch(`/leaves/${id}/cancel`);

// ── Admin / Manager Operations ──
export const getAllLeaves = (params) => api.get("/leaves", { params });
export const getLeaveSummary = () => api.get("/leaves/summary");
export const adminCreateLeave = (data) => api.post("/leaves/admin-create", data);
export const approveLeave = (id, data = {}) => api.patch(`/leaves/${id}/approve`, data);
export const rejectLeave = (id, data = {}) => api.patch(`/leaves/${id}/reject`, data);
export const getAllLeaveBalances = (params) => api.get("/leaves/balances", { params });
export const adjustLeaveBalance = (data) => api.patch("/leaves/adjust-balance", data);
