// components/modals/CreateAlbumModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { createAlbum } from "@/store/slices/albumSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateAlbumModal({ open, onOpenChange }) {
    const dispatch = useDispatch();
    const [albumName, setAlbumName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!albumName.trim()) {
            toast.error("Please enter album name");
            return;
        }

        setIsCreating(true);
        try {
            await dispatch(createAlbum({ name: albumName.trim() })).unwrap();
            toast.success("Album created successfully!");
            setAlbumName("");
            onOpenChange(false);
        } catch (error) {
            toast.error(error.message || "Failed to create album");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Album</DialogTitle>
                    <DialogDescription>
                        Give your album a name to organize your photos.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="albumName">Album Name</Label>
                            <Input
                                id="albumName"
                                placeholder="e.g., Vacation 2024, Family, Friends"
                                value={albumName}
                                onChange={(e) => setAlbumName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? "Creating..." : "Create Album"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}