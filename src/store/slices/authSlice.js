import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("ye_user");

const initialState = {
  token: localStorage.getItem("ye_token") || null,
  user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      localStorage.setItem("ye_token", token);
      localStorage.setItem("ye_user", JSON.stringify(user));
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("ye_token");
      localStorage.removeItem("ye_user");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
