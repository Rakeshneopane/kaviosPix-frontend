import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Images, Sparkles } from "lucide-react";
import FeaturedAlbum from "./FeaturedAlbum";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { fetchAllAlbum } from "@/store/slices/albumSlice";

import Photo1 from "../../assets/images/photo1.avif";
import Photo2 from "../../assets/images/photo2.avif";
import Photo3 from "../../assets/images/photo3.avif";
import Photo4 from "../../assets/images/photo4.avif";
import Photo5 from "../../assets/images/photo5.avif";

export default function AlbumSection(){

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { userData : user } = useSelector((state)=> {
        return state.userSlice
    });
    const { albumsData: albums, albumStatus, albumError } = useSelector((state)=>state.albumSlice);
    
    useEffect(()=>{
        const loadAlbum = async()=>{
        if(user && albumStatus === "idle")
            try {
                await dispatch(fetchAllAlbum()).unwrap();
            } catch (error) {
                console.log("error in dashboard fetchAllAlbums dispatch", error);
            }
        }
        loadAlbum();          
    },[user, dispatch, albumStatus]);

    if(albumStatus === "loading"){
        return(
            <div  
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
            >
                {[...Array(6)].map((_, i) => (
                    <Skeleton 
                        key={i} 
                        className="h-48 rounded-lg" 
                    />
                ))}
            </div>
        );
    }

     if (albumStatus === "error") {
        return (
            <div className="text-center py-8">
                <p 
                    className="text-red-500 mb-4"
                >
                    Error loading albums: {albumError}
                </p>
                <Button 
                    onClick={() => dispatch(fetchAllAlbum())}
                >
                    Try Again
                </Button>
            </div>
        );
    }
    
    if (!albums || albums.length === 0) {
        return (
            <div className="text-center py-8">
                <p 
                    className="text-gray-500"
                >
                    No albums yet. Upload your first photo!
                </p>
            </div>
        );
    }
    return (
        <div className="p-4 h-full flex flex-col"> 
            <div className="flex items-center justify-between mb-4">
                <h5 className="flex items-center gap-1 font-semibold">
                    <Sparkles className="h-4 w-4"/>
                    Recent Uploads
                </h5>
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={()=> navigate("/albums")}
                >
                    View all 
                    <ArrowRight className="h-4 w-4 ml-1"/>
                </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="w-full md:w-1/2">
                    {albums?.[0] && <FeaturedAlbum 
                            album={albums[0]}
                            onClick={() => navigate(`/album/${albums[0]._id}`)}
                            />}
                </div>
                
                <div className="w-full md:w-1/2">
                    <div className="grid grid-cols-2 gap-3 h-full">
                        
                        {albums?.slice(1, 5).map((album) => (
                            <SmallAlbumCard 
                                key={album._id} 
                                album={album} 
                                className="h-full"  
                                onClick={() => navigate(`/album/${album._id}`)}  
                            />
                       ))}

                        {Array.from({ 
                            length: Math.max(0, 4 - (albums?.slice(1,5).length || 0)) 
                        }).map((_, i) => (
                            <Card key={`sk-${i}`} className="overflow-hidden h-full">
                                {/* <Images className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/40" />
                                <img 
                                    src={Photo2} 
                                    alt="photo"
                                    className="w-full h-1/3 object-cover"
                                /> */}
                                <Skeleton className="h-full w-full" />
                                <Skeleton className={"h-1/4"}/>
                                <Skeleton className={"h-1/3 w-1/4"}/>
                                <Skeleton className={"h-1/3 w-1/4"}/>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SmallAlbumCard({ album, onClick }) {
    return (
        <Card 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
            onClick={onClick}    
        >
            <div className="relative h-28 bg-muted flex-shrink-0">
                {album ? (
                    <img 
                        src={Photo2} 
                        alt={album.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                        <Images className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                )}
                {album.sharedUserIds?.length > 0 && (
                    <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                        Shared
                    </Badge>
                )}
            </div>
            <div className="p-2">
                <p className="text-sm font-medium truncate">{album.name}</p>
                <p className="text-xs text-muted-foreground">{album.photoCount ?? 0} photos</p>
            </div>
        </Card>
    );
}