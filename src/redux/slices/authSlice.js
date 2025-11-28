import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: {
      id: "",
      fullName: "",
      username: "",
      email: "",
      contact: "",
      role: "",
    },
    loading: false,
    error: null,
  },
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.user?.id || "",
        fullName: action.payload.user?.fullName || "",
        username: action.payload.user?.username || "",
        email: action.payload.user?.email || "",
        contact: action.payload.user?.contact || "",
        role: action.payload.user?.role || "",
      };
      state.error = null;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {
        fullName: "",
        username: "",
        email: "",
        contact: "",
      };
      state.error = action.payload?.error || "Login failed";
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = {
        id: "",
        fullName: "",
        username: "",
        email: "",
        contact: "",
        role: "",
      };
      state.loading = false;
      state.error = null;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
