import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favorites: [],
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const existing = state.cart.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action) {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    adjustQuantity(state, action) {
      const item = state.cart.find((product) => product.id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
    },
    toggleFavorite(state, action) {
      const exists = state.favorites.find((item) => item.id === action.payload.id);
      if (exists) {
        state.favorites = state.favorites.filter((item) => item.id !== action.payload.id);
      } else {
        state.favorites.push(action.payload);
      }
    },
  },
});

export const { addToCart, removeFromCart, adjustQuantity, toggleFavorite } = cartSlice.actions;
export const selectFavorites = (state) => state.cart.favorites;
export const selectCart = (state) => state.cart.cart;
export const selectCartCount = (state) => state.cart.cart.reduce((sum, item) => sum + item.quantity, 0);
export default cartSlice.reducer;
