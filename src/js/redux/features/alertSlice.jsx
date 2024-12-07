import { createSlice } from "@reduxjs/toolkit";

export const alertSlice = createSlice({
  name: "user", // You might want to change this to "alert" if it's for managing alerts.
  initialState: {
    loading: false,
  },
  reducers: {
    showLoading: (state) => {
      state.loading = true;
    },
    hideLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { showLoading, hideLoading } = alertSlice.actions;

export default alertSlice.reducer; // Fixed here
