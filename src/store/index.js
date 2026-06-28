import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../redux/uiSlice.js';
import cartReducer from '../redux/cartSlice.js';

const STORAGE_KEY = 'velora-cart-state';

const loadCartState = () => {
  try {
    const serializedState = window.localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return undefined;
    return { cart: JSON.parse(serializedState) };
  } catch (error) {
    return undefined;
  }
};

const saveCartState = (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // ignore write errors
  }
};

const persistedState = loadCartState();

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    cart: cartReducer,
  },
  preloadedState: persistedState,
});

store.subscribe(() => {
  saveCartState(store.getState().cart);
});
