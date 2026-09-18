import api from "./api";
export const getOrders = (params) => api.get("/orders", { params }).then((r) => r.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const createOrder = (body) => api.post("/orders", body).then((r) => r.data);
export const updateOrderItems = (id, body) => api.put(`/orders/${id}/items`, body).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status }).then((r) => r.data);
export const cancelOrder = (id, reason) => api.post(`/orders/${id}/cancel`, { reason }).then((r) => r.data);
export const sendKOT = (orderId, itemIds) => api.post("/kots/send", { orderId, itemIds }).then((r) => r.data);
export const getKOTs = (params) => api.get("/kots", { params }).then((r) => r.data);
export const updateKOTStatus = (id, status) => api.patch(`/kots/${id}/status`, { status }).then((r) => r.data);
export const requestBill = (id) => api.post(`/orders/${id}/request-bill`).then((r) => r.data);
export const processBill = (id) => api.post(`/orders/${id}/process-bill`).then((r) => r.data);
export const getBillRequests = () => api.get("/orders/bill-requests/list").then((r) => r.data);
export const clearTable = (id) => api.post(`/orders/${id}/clear-table`).then((r) => r.data);

