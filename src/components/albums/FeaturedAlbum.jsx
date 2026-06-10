import { Card, CardContent } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Search, Upload, User, Menu, X, Camera, House, Image, Images, ArrowRight  } from "lucide-react";

import { useNavigate } from "react-router-dom";
import Photo1 from "../../assets/images/photo1.avif";
import Photo2 from "../../assets/images/photo2.avif";
import Photo3 from "../../assets/images/photo3.avif";
import Photo4 from "../../assets/images/photo4.avif";
import Photo5 from "../../assets/images/photo5.avif";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchAllImages } from "@/store/slices/imageSlice.js";
import { Skeleton } from "@/components/ui/skeleton.jsx";

export default function FeaturedAlbum ({ album }) {

    const { imagesData : images, imageStatus } = useSelector((state)=> state.imageSlice);

    console.log("from featured album: ", images);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    if (!album) {
        return (
            <Card className="overflow-hidden h-full">
                <Skeleton className="h-40 sm:h-48 md:h-56 lg:h-64" />
                <div className="p-3 md:p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </Card>
        );
    }

    useEffect(()=>{
        const loadImages = async()=>{
        if( album?._id && imageStatus === "idle"){
            try {
                await dispatch(fetchAllImages(album?._id)).unwrap();
            } catch (error) { 
                console.log("Error from feadtureed album: ", error.message );  
            }
        }
        loadImages();
    }
    }, [dispatch, album?._id, imageStatus]);

   
    const coverImage = images && images.length > 0 && images[0]?.url 
        ? images[0].url 
        : Photo1;
     
    return (
        <Card 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-full"
            onClick={() => navigate(`/album/${album._id}`)}
        >
            <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 bg-muted">
                    
                    <img 
                        src={coverImage} 
                        alt={album.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = Photo1;
                        }}
                    />
                    <Badge className="absolute top-2 left-2" variant="secondary">
                        Featured
                    </Badge>
            </div>

            <div className="p-3 md:p-4">
                <h3 className="font-semibold text-sm md:text-base mb-1 truncate">
                    {album.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                    {album.description || "No description available"}
                </p>
                <div className="flex items-center justify-between mt-2 md:mt-3">
                    <Badge variant="outline" className="text-[10px] md:text-xs">
                        {imageStatus === "loading" ? "..." : (images?.length || 0)} photos
                    </Badge>
                    <Button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/album/${album._id}`)
                        }}
                        variant="ghost" size="sm" className="text-xs md:text-sm"
                    >
                        View <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};