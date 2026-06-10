// components/images/ImageCard.jsx
import React, { useState } from 'react';
import { Heart, Trash2, Download, ZoomIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ImageCard({ image, onToggleFavorite, onDelete, onDownload, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Card
            className="relative overflow-hidden cursor-pointer group aspect-square rounded-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <img
                    src={image.url}
                    alt={image.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${isHovered ? 'scale-105' : 'scale-100'}`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />
            </div>

            {/* Overlay Controls */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="absolute top-2 right-2 flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite();
                        }}
                        className="p-2 bg-white/90 rounded-full hover:scale-110 transition"
                    >
                        <Heart
                            className={`w-5 h-5 ${
                                image.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                            }`}
                        />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload();
                        }}
                        className="p-2 bg-white/90 rounded-full hover:scale-110 transition"
                    >
                        <Download className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-2 bg-white/90 rounded-full hover:scale-110 transition"
                    >
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                </div>
                
                <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium truncate">{image.name}</p>
                    {image.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {image.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Favorite Badge */}
            {image.isFavorite && !isHovered && (
                <div className="absolute top-2 right-2">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500 drop-shadow-lg" />
                </div>
            )}
        </Card>
    );
}