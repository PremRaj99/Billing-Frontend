import { createSlice } from "@reduxjs/toolkit";

export const discountSlice = createSlice({
  name: "discount",
  initialState: { discount: null },
  reducers: {
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
  },
});

export const { setDiscount } = discountSlice.actions;
