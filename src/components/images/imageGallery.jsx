// components/images/ImageGallery.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllImages, toggleImages, deleteImage } from '@/store/slices/imageSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Trash2, Eye, Download, X } from 'lucide-react';
import ImageModal from './ImageModal';
import ImageUploader from './ImageUploader';
import { toast } from 'sonner';
import ImageCard from './ImageCard';

export default function ImageGallery({ albumId }) {
    const dispatch = useDispatch();
    const { imagesData, imageStatus } = useSelector((state) => state.imageSlice);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showUploader, setShowUploader] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest'); // latest, oldest, favorites

    useEffect(() => {
        if (albumId) {
            dispatch(fetchAllImages(albumId));
        }
    }, [albumId, dispatch]);

    const handleToggleFavorite = async (imageId, currentStatus) => {
        try {
            await dispatch(toggleImages({ 
                imageId, 
                imageData: { isFavorite: !currentStatus } 
            })).unwrap();
            toast.success(currentStatus ? 'Removed from favorites' : 'Added to favorites');
        } catch (error) {
            toast.error('Failed to update favorite status');
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await dispatch(deleteImage(imageId)).unwrap();
                toast.success('Image deleted successfully');
            } catch (error) {
                toast.error('Failed to delete image');
            }
        }
    };

    const handleDownloadImage = async (imageUrl, imageName) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = imageName || 'image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Download started');
        } catch (error) {
            toast.error('Failed to download image');
        }
    };

    // Filter and sort images
    const filteredAndSortedImages = React.useMemo(() => {
        let filtered = [...imagesData];
        
        if (searchTerm) {
            filtered = filtered.filter(img => 
                img.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                img.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        switch (sortBy) {
            case 'latest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'favorites':
                filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
                break;
            default:
                break;
        }
        
        return filtered;
    }, [imagesData, searchTerm, sortBy]);

    if (imageStatus === 'loading') {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
            </div>
        );
    }

    if (imageStatus === 'error') {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Failed to load images. Please try again.</p>
                <button 
                    onClick={() => dispatch(fetchAllImages(albumId))}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="latest">Latest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="favorites">Favorites First</option>
                    </select>
                </div>
                
                <button
                    onClick={() => setShowUploader(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
                >
                    + Upload Images
                </button>
            </div>

            {/* Image Grid */}
            {filteredAndSortedImages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-500">No images found</p>
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-blue-500 hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                    {filteredAndSortedImages.map((image) => (
                        <ImageCard
                            key={image._id}
                            image={image}
                            onToggleFavorite={() => handleToggleFavorite(image._id, image.isFavorite)}
                            onDelete={() => handleDeleteImage(image._id)}
                            onDownload={() => handleDownloadImage(image.url, image.name)}
                            onClick={() => setSelectedImage(image)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showUploader && (
                <ImageUploader 
                    albumId={albumId} 
                    onClose={() => setShowUploader(false)}
                    onSuccess={() => dispatch(fetchAllImages(albumId))}
                />
            )}

            {selectedImage && (
                <ImageModal 
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onToggleFavorite={() => handleToggleFavorite(selectedImage._id, selectedImage.isFavorite)}
                />
            )}
        </div>
    );
}