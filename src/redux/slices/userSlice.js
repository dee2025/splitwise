import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    fullName: "",
    username: "",
    email: "",
    token: "",
    isLoggedIn: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.fullName = action.payload.fullName;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logoutUser: (state) => {
      state.fullName = "";
      state.username = "";
      state.email = "";
      state.token = "";
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
