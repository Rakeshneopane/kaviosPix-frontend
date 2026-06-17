import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { clearImageStatus } from "@/store/slices/imageSlice";
import { fetchAlbum, clearAlbumStatus } from "@/store/slices/albumSlice";
import ImageGallery from "../images/ImageGallery.jsx";
import FavoriteImages from "../images/FavoriteImages.jsx";
import axiosInstance from "@/utils/axiosInstance.js";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AlbumDetailPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentAlbum } = useSelector((state) => state.albumSlice);
  const { imagesData: images } = useSelector((state) => state.imageSlice);
  const { userData: user } = useSelector((state) => state.userSlice);
  
  const isOwner = currentAlbum?._id?.toString() === albumId?.toString() && currentAlbum?.ownerId?.toString() === user?._id?.toString();

  const [activeTab, setActiveTab] = useState("all");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    if (albumId) {
      dispatch(fetchAlbum(albumId));
    }
    return () => {
      dispatch(clearImageStatus());
      dispatch(clearAlbumStatus());
    };
  }, [albumId, dispatch]);

  const handleShare = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = shareEmail.split(",").map(e => e.trim()).filter(Boolean);
    
    if (emails.length === 0) {
        toast.error("Please enter at least one email");
        return;
    }
    
    const invalidEmails = emails.filter(e => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
        toast.error(`Invalid emails: ${invalidEmails.join(", ")}`);
        return;
    }

    setShareLoading(true);
    try {
      await axiosInstance.post(`/album/${albumId}/share`, { emails });
      toast.success("Album shared successfully");
      setShareEmail("");
      setShareDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share album");
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            {isOwner && (
              <Button variant="outline" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button> 
            )}
            
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{currentAlbum?.name || "Album"}</h1>
            <p className="text-gray-500">{images?.length || 0} photos</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Photos
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === "favorites"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ❤️ Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className={activeTab === "all" ? "" : "hidden"}>
          <ImageGallery albumId={albumId} isOwner={isOwner} />
        </div>
        <div className={activeTab === "favorites" ? "" : "hidden"}>
          <FavoriteImages albumId={albumId} />
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Album</DialogTitle>
            <DialogDescription>
              Enter the email of the person you want to share this album with.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Enter email separated by commas..."
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={shareLoading}>
                {shareLoading ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}