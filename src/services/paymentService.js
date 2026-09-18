import api from "./api";
export const recordPayment = (body) => api.post("/payments", body).then((r) => r.data);
export const recordRefund = (body) => api.post("/payments/refund", body).then((r) => r.data);
export const generateInvoice = (orderId) => api.post("/invoices", { orderId }).then((r) => r.data);
export const getInvoice = (orderId) => api.get(`/invoices/order/${orderId}`).then((r) => r.data);
