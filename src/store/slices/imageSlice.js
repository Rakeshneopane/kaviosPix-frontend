import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const initialState = {
    imagesData: [],
    currentImage: null, 
    favoriteImages: null,
    imageStatus: "idle",
    imageError: null,
}

export const uploadImages = createAsyncThunk("image/upload", async( imageData, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.post(`/image/upload`, imageData);
        console.log("response of filtered images thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})

export const fetchImage = createAsyncThunk("image/fetch", async( imageId, {rejectWithValue})=>{
    try {
        const response = await axiosInstance.get(`/image/${imageId}`);
        console.log("response of fetch particular image thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})

export const fetchAllImages = createAsyncThunk("all_image/fetch", async( albumId, {rejectWithValue})=>{
    try {
        const response = await axiosInstance.get(`/image/${albumId}/images`);
        console.log("response of fetch all image thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message); 
    }
})

export const favoriteImages = createAsyncThunk("image/favorites", async( albumId, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.get(`/image/${albumId}/images/favorites`);
        console.log("response of create album thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})

export const deleteImage = createAsyncThunk("image/delete", async( imageId, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.delete(`/image/delete/${imageId}`);
        console.log("response of delete image thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})

export const filteredImages = createAsyncThunk("image/filtered", async({ albumId, tag }, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.get(`/image/${albumId}/images/filter?tag=${tag}`);
        console.log("response of filtered images thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})

export const toggleImages = createAsyncThunk("image/toggled", async( { imageId, imageData }, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.put(`/image/${imageId}/toggle`, imageData);
        console.log("response of filtered images thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})

export const commentImages = createAsyncThunk("image/commented", async( { imageId, comments }, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.patch(`/image/${imageId}/comment`, comments);
        console.log("response of filtered images thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
})


const imageReducer = createSlice({
    name: "image",
    initialState,
    reducers: {
        clearImageStatus: (state) => {
            state.imageStatus = "idle";
        }
    },
    extraReducers: (builder)=>{
        builder
        // upload Images
        .addCase(uploadImages.pending, (state)=>{
            state.imageStatus="loading";
        })
        .addCase(uploadImages.fulfilled, (state, action)=>{
            state.imageStatus = "success";
            if (action.payload.images) {
                state.imagesData = [...state.imagesData, ...action.payload.images];
            }
        })
        .addCase(uploadImages.rejected, (state, action)=>{
            state.imageStatus = "error";
            state.imageError = action.payload;
        })
        // fetch all Images
        .addCase(fetchAllImages.pending, (state)=>{
            state.imageStatus="loading";
        })
        .addCase(fetchAllImages.fulfilled, (state, action)=>{
            state.imageStatus = "success";
            state.imagesData = action.payload.images;
        })
        .addCase(fetchAllImages.rejected, (state, action)=>{
            state.imageStatus = "error";
            state.imageError = action.payload;
        })
        // fetch an image
        .addCase(fetchImage.pending, (state)=>{
            state.imageStatus="loading";
        })
        .addCase(fetchImage.fulfilled, (state, action)=>{
            state.imageStatus = "success";
            state.currentImage = action.payload.image;
        })
        .addCase(fetchImage.rejected, (state, action)=>{
            state.imageStatus = "error";
            state.imageError = action.payload;
        })
        //get favorites images
        .addCase(favoriteImages.pending, (state)=>{
            state.imageStatus="loading";
        })
        .addCase(favoriteImages.fulfilled, (state, action)=>{
            state.imageStatus = "success";
            state.favoriteImages = action.payload.image;
        })
        .addCase(favoriteImages.rejected, (state, action)=>{
            state.imageStatus = "error";
            state.imageError = action.payload;
        })
        //toggle image
        .addCase(toggleImages.pending, (state)=>{
            state.imageStatus="loading";
        })
        .addCase(toggleImages.fulfilled, (state, action)=>{
            state.imageStatus = "success";
            state.imagesData = state.imagesData.map((image)=>
                    image._id === action.payload.image._id 
                        ? { ...image, isFavorite: action.payload.image.isFavorite }
                        : image
                );                
            })
        .addCase(toggleImages.rejected, (state, action)=>{
            state.imageStatus = "error";
            state.imageError = action.payload;
        })
        //add comments in image
        .addCase(commentImages.pending, (state)=>{
            state.imageStatus="loading";
        })
        .addCase(commentImages.fulfilled, (state, action)=>{
            state.imageStatus = "success";
            state.imagesData = state.imagesData.map((image)=> {
                if(image._id == action.payload.image._id){
                    return {...image, comments: action.payload.image.comments}
                }
                return image;
            });
        })
        .addCase(commentImages.rejected, (state, action)=>{
            state.imageStatus = "error";
            state.imageError = action.payload;
        })
        // delete image
        .addCase(deleteImage.pending, (state)=>{
            state.imageStatus="loading";
        })
        .addCase(deleteImage.fulfilled, (state, action)=>{
            state.imageStatus = "success";
            state.imagesData = state.imagesData.filter((image)=> image._id !== action.payload.image._id);
        })
        .addCase(deleteImage.rejected, (state, action)=>{
            state.imageStatus = "error";
            state.imageError = action.payload;
        })
    }
});

export const { clearImageStatus } = imageReducer.actions;

const { reducer } = imageReducer;
export default reducer;