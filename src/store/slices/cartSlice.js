import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderType: "DINE_IN",
  table: null,
  items: [], // { menuItem, name, price, taxPercent, quantity, notes }
  discount: 0,
  notes: "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setOrderType(state, action) { state.orderType = action.payload; },
    setTable(state, action) { state.table = action.payload; },
    addItem(state, action) {
      const item = action.payload;
      const existing = state.items.find((i) => i.menuItem === item.menuItem);
      if (existing) existing.quantity += 1;
      else state.items.push({ ...item, quantity: 1 });
    },
    incrementItem(state, action) {
      const item = state.items.find((i) => i.menuItem === action.payload);
      if (item) item.quantity += 1;
    },
    decrementItem(state, action) {
      const item = state.items.find((i) => i.menuItem === action.payload);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) state.items = state.items.filter((i) => i.menuItem !== action.payload);
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.menuItem !== action.payload);
    },
    setItemNotes(state, action) {
      const { menuItem, notes } = action.payload;
      const item = state.items.find((i) => i.menuItem === menuItem);
      if (item) item.notes = notes;
    },
    setDiscount(state, action) { state.discount = action.payload; },
    setOrderNotes(state, action) { state.notes = action.payload; },
    clearCart(state) {
      state.items = [];
      state.discount = 0;
      state.notes = "";
      state.table = null;
    },
  },
});

export const {
  setOrderType, setTable, addItem, incrementItem, decrementItem,
  removeItem, setItemNotes, setDiscount, setOrderNotes, clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
