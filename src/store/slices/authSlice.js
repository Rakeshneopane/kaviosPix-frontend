import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance.js";

const initialState = {
    userData: null,
    userStatus: "idle",
    userError: null,
}

export const fetchUser = createAsyncThunk("user/fetch", async(_, {rejectWithValue})=>{
    try {
        const response = await axiosInstance.get(`/auth/me`);
        console.log("response of fetch user thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})


const userReducer = createSlice({
    name: "userSliceNamesake",
    initialState,
    reducers: {},
    extraReducers: (builder)=>{
        builder
        // fetch user
        .addCase(fetchUser.pending, (state)=>{
            state.userStatus = "loading";
            state.userError = null;
        })
        .addCase(fetchUser.fulfilled, (state, action)=>{
            console.log("FULFILLED - updating state");
            state.userStatus = "success";
            state.userData = action.payload.user;
            state.userError = null;
        })
        .addCase(fetchUser.rejected, (state, action)=>{
            state.userStatus = "error";
            state.userError = action.payload;
        })
    }
});

const { reducer } = userReducer;
export default reducer;