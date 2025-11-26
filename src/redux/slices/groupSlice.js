import { createSlice } from "@reduxjs/toolkit";

const groupsSlice = createSlice({
  name: "groups",
  initialState: [],
  reducers: {
    setGroups: (state, action) => action.payload,
    addGroup: (state, action) => state.push(action.payload),
    updateGroup: (state, action) => {
      const index = state.findIndex(g => g._id === action.payload._id);
      if (index !== -1) state[index] = action.payload;
    }
  }
});

export const { setGroups, addGroup, updateGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
