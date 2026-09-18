import api from "./api";
export const getMenu = (params) => api.get("/menu", { params }).then((r) => r.data);
export const getCategories = () => api.get("/categories").then((r) => r.data);
export const toggleAvailability = (id) => api.patch(`/menu/${id}/availability`).then((r) => r.data);
export const createMenuItem = (body) => api.post("/menu", body).then((r) => r.data);
export const updateMenuItem = (id, body) => api.put(`/menu/${id}`, body).then((r) => r.data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`).then((r) => r.data);
export const createCategory = (body) => api.post("/categories", body).then((r) => r.data);
