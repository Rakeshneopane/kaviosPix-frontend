// components/images/FavoriteImages.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { favoriteImages } from '@/store/slices/imageSlice';
import ImageCard from './ImageCard';
import { Heart } from 'lucide-react';

export default function FavoriteImages({ albumId }) {
    const dispatch = useDispatch();
    const { favoriteImages, imageStatus } = useSelector((state) => state.imageSlice);
    
    useEffect(() => {
        if (albumId) {
            dispatch(favoriteImages(albumId));
        }
    }, [albumId, dispatch]);
    
    if (imageStatus === 'loading') {
        return <div className="text-center py-12">Loading favorites...</div>;
    }
    
    if (!favoriteImages?.length) {
        return (
            <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No favorite images yet</p>
                <p className="text-sm text-gray-400">Heart some images to see them here</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {favoriteImages.map((image) => (
                <ImageCard key={image._id} image={image} />
            ))}
        </div>
    );
}