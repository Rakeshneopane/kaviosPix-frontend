import { useState, useEffect } from "react";
import AlbumCard from "./AlbumCard.jsx";
import { useSelector, useDispatch } from "react-redux";
import { Search, Funnel, Plus, Images } from "lucide-react";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { useNavigate } from "react-router-dom";
import { fetchAllAlbum, deleteAlbum } from "@/store/slices/albumSlice.js";
import { toast } from "sonner";
import  CreateAlbumModal from "@/components/modals/CreateAlbumModal.jsx"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"; 

export default function AlbumsPage() {
    const { albumsData: albums, albumStatus, albumError } = useSelector((state) => state.albumSlice);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(()=>{
        if(albumStatus === "idle"){
            dispatch(fetchAllAlbum());
        }
    }, [dispatch, albumStatus]);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateAlbum, setShowCreateAlbum] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [albumToDelete, setAlbumToDelete] = useState(null);

    const handleDeleteAlbum = async () => {
        if (albumToDelete) {
            try {
                await dispatch(deleteAlbum(albumToDelete)).unwrap();
                toast.success("Album deleted successfully");
                dispatch(fetchAllAlbum());
            } catch (error) {
                toast.error("Failed to delete album" || error.message);
            } finally {
                setDeleteDialogOpen(false);
                setAlbumToDelete(null);
            }
        }
    };

    console.log(albums);
    let filteredAlbums = albums?.filter(album => 
        album.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    filteredAlbums = [...filteredAlbums].sort((a, b) => {
        switch(sortBy) {
            case "newest":
                return new Date(b.createdAt) - new Date(a.createdAt);
            case "oldest":
                return new Date(a.createdAt) - new Date(b.createdAt);
            case "nameAsc":
                return a.name.localeCompare(b.name);
            case "nameDesc":
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
    
    // Loading state
    if (albumStatus === "loading") {
        return (
            <div className="p-4">
                {/* Header Skeletons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <div>
                        <Skeleton className="h-7 w-20 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-[200px]" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
                
                {/* Grid Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <AlbumCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }
    // Error state
    if (albumStatus === "error") {
        return (
            <div className="p-4 text-center py-12">
                <p className="text-red-500 mb-4">Error loading albums: {albumError}</p>
                <Button onClick={() => dispatch(fetchAllAlbum())}>
                    Try Again
                </Button>
            </div>
        );
    }
    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                    <h5 className="text-lg font-bold">Albums</h5>
                    <p className="text-muted-foreground text-sm">
                        {filteredAlbums.length} {filteredAlbums.length === 1 ? "Album" : "Albums"}
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/3 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />  
                        <Input 
                            placeholder="Search albums..."
                            className="pl-8 h-8 text-sm w-[200px]" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />    
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded"
                         onClick={() => setFilterDialogOpen(true)}
                    > 
                        <Funnel className="h-4 w-4" /> 
                    </Button>

                    
                    <Button 
                        size="sm" 
                        onClick={() => setShowCreateAlbum(true)}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Create Album
                    </Button>

                    
                </div>
            </div>
        
            {/* Empty State */}
            {filteredAlbums.length === 0 && (
                <div className="text-center py-12 border rounded-lg">
                    <Images className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                        {searchTerm ? "No albums match your search" : "No albums yet. Create your first album!"}
                    </p>
                    {!searchTerm && (
                        <Button className="mt-4" onClick={() => setShowCreateAlbum(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Create Album
                        </Button>
                    )}
                </div>
            )}

            { filteredAlbums.length > 0 && (
                /* Album Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAlbums.map((album) => (
                        <AlbumCard 
                            key={album._id} 
                            album={album} 
                            onClick={() => navigate(`/album/${album._id}`)}
                            onDelete={() => {
                                setAlbumToDelete(album._id);
                                setDeleteDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <CreateAlbumModal 
                open={showCreateAlbum} 
                onOpenChange={setShowCreateAlbum}
            />

            <FilterDialog 
                open={filterDialogOpen}
                onOpenChange={setFilterDialogOpen}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* Delete Donfirmmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Album?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All photos in this album will be moved to "Default Album".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAlbum}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

// Skeleton Component for AlbumCard
function AlbumCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
}

function FilterDialog({ open, onOpenChange, sortBy, onSortChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Sort & Filter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Sort By</Label>
                        <select 
                            className="w-full mt-1 p-2 border rounded"
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="nameAsc">Name (A-Z)</option>
                            <option value="nameDesc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}