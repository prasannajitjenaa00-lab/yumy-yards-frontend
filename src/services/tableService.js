import api from "./api";
export const getTables = () => api.get("/tables").then((r) => r.data);
export const bulkCreateTables = (count, zone) => api.post("/tables/bulk", { count, zone }).then((r) => r.data);
export const updateTable = (id, body) => api.put(`/tables/${id}`, body).then((r) => r.data);
