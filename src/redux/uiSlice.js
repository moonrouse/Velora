import { createSlice } from '@reduxjs/toolkit';

const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('velora-theme') : null;
const savedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('velora-locale') : null;

const initialState = {
  theme: savedTheme || 'light',
  locale: savedLocale || 'ru',
  searchQuery: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('velora-theme', state.theme);
    },
    setLocale(state, action) {
      state.locale = action.payload;
      window.localStorage.setItem('velora-locale', state.locale);
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
  },
});

export const { toggleTheme, setLocale, setSearchQuery } = uiSlice.actions;
export const selectTheme = (state) => state.ui.theme;
export const selectLocale = (state) => state.ui.locale;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export default uiSlice.reducer;
