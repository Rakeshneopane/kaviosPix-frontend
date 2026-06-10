// pages/AlbumDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Heart, Upload, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchAllImages, toggleImages, deleteImage, clearImageStatus } from "@/store/slices/imageSlice";
import { fetchAllAlbum, fetchAlbum } from "@/store/slices/albumSlice";
import UploadModal from "../modals/uploadModal";

export default function AlbumDetailPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { imagesData: images, imageStatus } = useSelector((state) => state.imageSlice);
  const { currentAlbum, albumStatus, albumError } = useSelector((state) => state.albumSlice);
  
  const [showUploader, setShowUploader] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const album = currentAlbum;
  
  useEffect(() => {
    if (albumId) {
      dispatch(fetchAllImages(albumId));
      dispatch(fetchAlbum(albumId));
        
    }
    return () => {
        dispatch(clearImageStatus());
    };
  }, [albumId, dispatch]);
  
  const handleToggleFavorite = async (imageId, currentStatus) => {
    try {
      await dispatch(toggleImages({ imageId, imageData: { isFavorite: !currentStatus } })).unwrap();
      toast.success(currentStatus ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      toast.error("Failed to update");
    }
  };
  
  const handleDeleteClick = async (imageId) => {
    setImageToDelete(imageId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (imageToDelete) {
      try {
        await dispatch(deleteImage(imageToDelete)).unwrap();
        toast.success("Image deleted successfully");
        dispatch(fetchAllImages(albumId));
      } catch (error) {
        toast.error("Failed to delete image");
      } finally {
        setDeleteDialogOpen(false);
        setImageToDelete(null);
      }
    }
  };
  // Loading
  if (imageStatus === "loading" && !images?.length) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={() => setShowUploader(true)}>
              <Upload className="h-4 w-4 mr-2" /> Upload
            </Button>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{album?.name || "Album"}</h1>
            <p className="text-gray-500">{images?.length || 0} photos</p>
          </div>
        </div>
      </div>
      
      {/* Image Grid */}
      <div className="container mx-auto px-4 py-8">
        {!images || images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No photos yet. Click Upload to add photos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image._id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full w-9 h-9 hover:scale-110 transition-transform "
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(image._id, image.isFavorite);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${image.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="rounded-full w-9 h-9 hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(image._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Favorite Badge */}
                {image.isFavorite && (
                  <div className="absolute top-2 right-2 z-10">
                    <Heart className="h-5 w-5 fill-red-500 text-red-500 drop-shadow-md" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteDialogOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Delete Image?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.url} alt={selectedImage.name} className="max-w-full max-h-[90vh] object-contain" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <p>{selectedImage.name}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Modal */}
      <UploadModal open={showUploader} onOpenChange={setShowUploader} />
    </div>
  );
}