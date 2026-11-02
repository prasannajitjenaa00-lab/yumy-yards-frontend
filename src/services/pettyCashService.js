import api from "./api";

export const getPettyCashSummary = () => api.get("/petty-cash/summary").then((r) => r.data);
export const getPettyCashTransactions = (params) => api.get("/petty-cash", { params }).then((r) => r.data);
export const recordCashIn = (data) => api.post("/petty-cash/cash-in", data).then((r) => r.data);
export const recordCashOut = (data) => api.post("/petty-cash/cash-out", data).then((r) => r.data);

