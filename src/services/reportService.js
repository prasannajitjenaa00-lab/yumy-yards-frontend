import api from "./api";
export const getDashboard = () => api.get("/reports/dashboard").then((r) => r.data);
export const getSalesReport = (params) => api.get("/reports/sales", { params }).then((r) => r.data);
export const getOrderReport = (params) => api.get("/reports/orders", { params }).then((r) => r.data);
export const getPaymentReport = (params) => api.get("/reports/payments", { params }).then((r) => r.data);
export const getInventoryReport = (params) => api.get("/reports/inventory", { params }).then((r) => r.data);
export const getProductReport = (params) => api.get("/reports/products", { params }).then((r) => r.data);
export const getGstReport = (params) => api.get("/reports/gst", { params }).then((r) => r.data);
