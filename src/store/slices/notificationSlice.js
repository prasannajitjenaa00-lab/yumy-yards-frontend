import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: { items: [] },
  reducers: {
    pushNotification(state, action) {
      state.items.unshift({ id: Date.now(), ...action.payload });
      state.items = state.items.slice(0, 20);
    },
    clearNotifications(state) { state.items = []; },
  },
});

export const { pushNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
