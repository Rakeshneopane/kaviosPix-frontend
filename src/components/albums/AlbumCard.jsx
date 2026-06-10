import { 
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, ImageIcon, Trash2 } from "lucide-react";

import { useState } from "react";

import Photo1 from "../../assets/images/photo1.avif";
import Photo2 from "../../assets/images/photo2.avif";
import Photo3 from "../../assets/images/photo3.avif";
import Photo4 from "../../assets/images/photo4.avif";
import Photo5 from "../../assets/images/photo5.avif";

export default function AlbumCard({ album, onClick, onDelete }) {

    const [imageError, setImageError] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    
    const isShared = album.sharedUserIds && album.sharedUserIds.length > 0;

    return (
        <Card 
            className="overflow-hidden hover:shadow-lg transition-all"
            onClick={onClick}    
        >
            <div className="aspect-video bg-muted flex items-center justify-center">
               {!imageError ? (
                    <img 
                        src={Photo1} 
                        alt={album.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}
            </div>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-base truncate flex-1">
                        {album.name}
                    </CardTitle>
                    <Badge variant={isShared ? "default" : "secondary"} className="ml-2">
                        {isShared ? "Shared" : "Private"}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-xs">
                    {album.description || "No description"}
                </CardDescription>
            </CardHeader>            
            <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
                <span>{album.photoCount || 0} photos </span>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Open menu for album:", album._id);
                    }}
                >
                    <MoreVertical className="h-3.5 w-3.5" />
                </Button>

                {onDelete && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}

            </CardFooter>
        </Card>
    );
}