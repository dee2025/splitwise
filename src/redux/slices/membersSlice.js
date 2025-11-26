import { createSlice } from "@reduxjs/toolkit";

const membersSlice = createSlice({
  name: "members",
  initialState: [],
  reducers: {
    setMembers: (state, action) => action.payload,
    addMember: (state, action) => state.push(action.payload),
  }
});

export const { setMembers, addMember } = membersSlice.actions;
export default membersSlice.reducer;
