import { createSlice } from "@reduxjs/toolkit";

const createGroupSlice = createSlice({
  name: "createGroup",
  initialState: {
    name: "",
    description: "",
    members: [],
  },
  reducers: {
    setGroupName: (state, action) => { state.name = action.payload; },
    setGroupDescription: (state, action) => { state.description = action.payload; },
    addGroupMember: (state, action) => state.members.push(action.payload),
    removeGroupMember: (state, action) => {
      state.members = state.members.filter(m => m.email !== action.payload.email);
    },
    resetGroup: (state) => {
      state.name = "";
      state.description = "";
      state.members = [];
    }
  }
});

export const { setGroupName, setGroupDescription, addGroupMember, removeGroupMember, resetGroup } = createGroupSlice.actions;
export default createGroupSlice.reducer;
