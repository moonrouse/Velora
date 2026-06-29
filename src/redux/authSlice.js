import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  registeredUser: null,
  currentUser: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerUser(state, action) {
      state.registeredUser = action.payload;
      state.currentUser = {
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
      };
    },
    loginUser(state) {
      if (!state.registeredUser) return;
      state.currentUser = {
        name: state.registeredUser.name,
        email: state.registeredUser.email,
        phone: state.registeredUser.phone,
      };
    },
    logoutUser(state) {
      state.currentUser = null;
    },
  },
});

export const { registerUser, loginUser, logoutUser } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectRegisteredUser = (state) => state.auth.registeredUser;
export default authSlice.reducer;
