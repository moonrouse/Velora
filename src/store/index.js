import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../redux/uiSlice.js';
import cartReducer from '../redux/cartSlice.js';
import authReducer from '../redux/authSlice.js';

const STORAGE_KEY = 'velora-cart-state';
const AUTH_STORAGE_KEY = 'velora-auth-state';

const loadCartState = () => {
  try {
    const serializedState = window.localStorage.getItem(STORAGE_KEY);
    const authState = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!serializedState && !authState) return undefined;
    return {
      ...(serializedState ? { cart: JSON.parse(serializedState) } : {}),
      ...(authState ? { auth: JSON.parse(authState) } : {}),
    };
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
    auth: authReducer,
  },
  preloadedState: persistedState,
});

store.subscribe(() => {
  saveCartState(store.getState().cart);
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(store.getState().auth));
  } catch (error) {
    // The app remains usable when local storage is unavailable.
  }
});
