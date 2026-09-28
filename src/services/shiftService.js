import api from "./api";

// Staff Shift APIs
export const getStaffShifts = () => api.get("/staff-shifts");
export const getMyStaffShift = () => api.get("/staff-shifts/my-shift");
export const createStaffShift = (data) => api.post("/staff-shifts", data);
export const updateStaffShift = (id, data) => api.put(`/staff-shifts/${id}`, data);
export const deleteStaffShift = (id) => api.delete(`/staff-shifts/${id}`);
