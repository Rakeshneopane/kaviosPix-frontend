import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const initialState = {
    imagesData: [],
    currentImage: null, 
    favoriteImages: [],
    currentAlbumId: null,

    // Split status flags
    fetchImagesStatus: "idle",
    fetchFavoritesStatus: "idle",
    fetchSingleStatus: "idle",
    uploadStatus: "idle",
    deleteStatus: "idle",
    toggleStatus: "idle",
    commentStatus: "idle",

    imageError: null,
}

export const uploadImages = createAsyncThunk("image/upload", async( imageData, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.post(`/image/upload`, imageData);
        console.log("response of upload images thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message ?? error.message ?? 'Unknown error');
    }
})

export const fetchImage = createAsyncThunk("image/fetch", async( imageId, {rejectWithValue})=>{
    try {
        const response = await axiosInstance.get(`/image/${imageId}`);
        console.log("response of fetch particular image thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message ?? error.message ?? 'Unknown error');
    }
})

export const fetchAllImages = createAsyncThunk("all_image/fetch", async( albumId, {rejectWithValue})=>{
    try {
        const response = await axiosInstance.get(`/image/${albumId}/images`);
        console.log("response of fetch all image thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message ?? error.message ?? 'Unknown error'); 
    }
})

export const favoriteImages = createAsyncThunk("image/favorites", async( albumId, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.get(`/image/${albumId}/images/favorites`);
        console.log("response of fetch favorites thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message ?? error.message ?? 'Unknown error');
    }
})

export const deleteImage = createAsyncThunk("image/delete", async( imageId, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.delete(`/image/delete/${imageId}`);
        console.log("response of delete image thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message ?? error.message ?? 'Unknown error');
    }
})

export const toggleImages = createAsyncThunk("image/toggled", async( { imageId, imageData }, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.put(`/image/${imageId}/toggle`, imageData);
        console.log("response of toggle images thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message ?? error.message ?? 'Unknown error');
    }
})

export const commentImages = createAsyncThunk("image/commented", async( { imageId, comments }, {rejectWithValue} )=>{
    try {
        const response = await axiosInstance.patch(`/image/${imageId}/comment`, comments);
        console.log("response of comment images thunk", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message ?? error.message ?? 'Unknown error');
    }
})


const imageReducer = createSlice({
    name: "image",
    initialState,
    reducers: {
        clearImageStatus: (state) => {
            state.fetchImagesStatus = "idle";
            state.fetchFavoritesStatus = "idle";
            state.fetchSingleStatus = "idle";
            state.uploadStatus = "idle";
            state.deleteStatus = "idle";
            state.toggleStatus = "idle";
            state.commentStatus = "idle";
            state.imageError = null;
        }
    },
    extraReducers: (builder)=>{
        builder
        // upload Images
        .addCase(uploadImages.pending, (state)=>{
            state.uploadStatus="loading";
        })
        .addCase(uploadImages.fulfilled, (state, action)=>{
            state.uploadStatus = "success";
            if (action.payload?.images) {
                state.imagesData = [...state.imagesData, ...action.payload.images];
            }
        })
        .addCase(uploadImages.rejected, (state, action)=>{
            state.uploadStatus = "error";
            state.imageError = action.payload;
        })
        // fetch all Images
        .addCase(fetchAllImages.pending, (state, action)=>{
            state.fetchImagesStatus="loading";
            state.currentAlbumId = action.meta.arg;
        })
        .addCase(fetchAllImages.fulfilled, (state, action)=>{
            if (action.meta.arg === state.currentAlbumId) {
                state.fetchImagesStatus = "success";
                state.imagesData = action.payload?.images || [];
            }
        })
        .addCase(fetchAllImages.rejected, (state, action)=>{
            if (action.meta.arg === state.currentAlbumId) {
                state.fetchImagesStatus = "error";
                state.imageError = action.payload;
            }
        })
        // fetch an image
        .addCase(fetchImage.pending, (state)=>{
            state.fetchSingleStatus="loading";
        })
        .addCase(fetchImage.fulfilled, (state, action)=>{
            state.fetchSingleStatus = "success";
            state.currentImage = action.payload?.image;
        })
        .addCase(fetchImage.rejected, (state, action)=>{
            state.fetchSingleStatus = "error";
            state.imageError = action.payload;
        })
        //get favorites images
        .addCase(favoriteImages.pending, (state, action)=>{
            state.fetchFavoritesStatus="loading";
            state.currentAlbumId = action.meta.arg;
        })
        .addCase(favoriteImages.fulfilled, (state, action)=>{
            if (action.meta.arg === state.currentAlbumId) {
                state.fetchFavoritesStatus = "success";
                state.favoriteImages = action.payload?.image || []; // Backend returns `image` containing favorite images array
            }
        })
        .addCase(favoriteImages.rejected, (state, action)=>{
            if (action.meta.arg === state.currentAlbumId) {
                state.fetchFavoritesStatus = "error";
                state.imageError = action.payload;
            }
        })
        //toggle image
        .addCase(toggleImages.pending, (state)=>{
            state.toggleStatus="loading";
        })
        .addCase(toggleImages.fulfilled, (state, action)=>{
            state.toggleStatus = "success";
            if (action.payload?.image?._id) {
                const updatedImage = action.payload.image;
                state.imagesData = state.imagesData.map((image)=>
                    image._id === updatedImage._id 
                        ? { ...image, isFavorite: updatedImage.isFavorite }
                        : image
                );
                if (state.favoriteImages) {
                    if (updatedImage.isFavorite) {
                        // If favorited and not present in favoriteImages, push it (best effort)
                        if (!state.favoriteImages.some(img => img._id === updatedImage._id)) {
                            state.favoriteImages.push(updatedImage);
                        }
                    } else {
                        // If unfavorited, remove from favoriteImages
                        state.favoriteImages = state.favoriteImages.filter(img => img._id !== updatedImage._id);
                    }
                }
            }
        })
        .addCase(toggleImages.rejected, (state, action)=>{
            state.toggleStatus = "error";
            state.imageError = action.payload;
        })
        //add comments in image
        .addCase(commentImages.pending, (state)=>{
            state.commentStatus="loading";
        })
        .addCase(commentImages.fulfilled, (state, action)=>{
            state.commentStatus = "success";
            if (action.payload?.image?._id) {
                const updatedImage = action.payload.image;
                state.imagesData = state.imagesData.map((image)=> {
                    if(image._id === updatedImage._id){
                        return {...image, comments: updatedImage.comments}
                    }
                    return image;
                });
                if (state.favoriteImages) {
                    state.favoriteImages = state.favoriteImages.map((image)=> {
                        if(image._id === updatedImage._id){
                            return {...image, comments: updatedImage.comments}
                        }
                        return image;
                    });
                }
            }
        })
        .addCase(commentImages.rejected, (state, action)=>{
            state.commentStatus = "error";
            state.imageError = action.payload;
        })
        // delete image
        .addCase(deleteImage.pending, (state)=>{
            state.deleteStatus="loading";
        })
        .addCase(deleteImage.fulfilled, (state, action)=>{
            state.deleteStatus = "success";
            if (action.payload?.image?._id) {
                const deletedImageId = action.payload.image._id;
                state.imagesData = state.imagesData.filter((image)=> image._id !== deletedImageId);
                if (state.favoriteImages) {
                    state.favoriteImages = state.favoriteImages.filter((image)=> image._id !== deletedImageId);
                }
            }
        })
        .addCase(deleteImage.rejected, (state, action)=>{
            state.deleteStatus = "error";
            state.imageError = action.payload;
        })
    }
});

export const { clearImageStatus } = imageReducer.actions;

const { reducer } = imageReducer;
export default reducer;