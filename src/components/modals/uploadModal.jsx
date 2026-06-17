import { 
    Dialog, 
    DialogTrigger, 
    DialogHeader, 
    DialogTitle, 
    DialogContent, 
    DialogDescription 
} from "../ui/dialog.jsx";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select.jsx";

import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Button } from "../ui/button.jsx";
import { useSelector, useDispatch } from "react-redux";
import { uploadImages, clearImageStatus } from "../../store/slices/imageSlice.js";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function UploadModal({ open, onOpenChange }){

    const dispatch = useDispatch();
    const [imageFile, setImageFile] = useState({
        type: "",
        tags: "",
        albumId: "",
        file: null,
    });

    const [isUploading, setIsUploading] = useState(false);
    const {albumsData: albums} = useSelector((state)=> state.albumSlice);

    const { uploadStatus, imageError } = useSelector((state)=> state.imageSlice);
    const defaultAlbum = albums?.find((album)=> album.isDefault); 

    useEffect(() => {
        if (open && defaultAlbum && !imageFile.albumId) {
            setImageFile(prev => ({ ...prev, albumId: defaultAlbum._id }));
        }
    }, [open, defaultAlbum, imageFile.albumId]);

    useEffect(() => {
        if (!open) {
            // When modal closes, reset upload status so it doesn't linger
            dispatch(clearImageStatus());
            setIsUploading(false);
            return;
        }

        if (uploadStatus === "success") {
            setIsUploading(false);
            toast.success("Upload successful!");
            // Reset form
            setImageFile({ type: "", tags: "", albumId: "", file: null });
            // Clear status
            dispatch(clearImageStatus());
            onOpenChange(false);
        }
        
        if (uploadStatus === "error") {
            setIsUploading(false);
            toast.error(imageError || "Upload failed");
            dispatch(clearImageStatus());
        }
    }, [open, uploadStatus, imageError, dispatch, onOpenChange]);

    function handleFileChange(e){
        
        const file = e.target.files[0];
        if (!file) return;
        
        const MAX_BYTES = 5 * 1024 * 1024;
        const acceptedName = ["jpeg", "png", "jpg", "webp",];
        if(file.size > MAX_BYTES){
            return alert("File size is more than 5 MB");
        }
        if(!acceptedName.includes(file.type.split("/")[1])){
            return alert("file not of image file type");
        }
        setImageFile((prev)=> (
            {...prev, 
            type: file.type,
            file,
         }));
    }

    function handleSubmit(e){
        e.preventDefault();
        if (!imageFile.file) {
            return alert("Please select a file");
        }
        
        if (!imageFile.albumId) {
            return alert("Please select an album");
        }
        
        setIsUploading(true);

        const formData = new FormData();

        formData.append("images", imageFile.file); // Backend expects "images" field name matching upload.array("images", 15)

        const tagsArray = imageFile.tags 
                            ? imageFile.tags.split(",").map((tag)=>tag.trim())
                            : [];

        formData.append("tags", JSON.stringify(tagsArray));
        formData.append("albumId", imageFile.albumId);
        
        dispatch(uploadImages(formData));
    }

    return(
        <Dialog open={open} onOpenChange={onOpenChange} >            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle> Upload image </DialogTitle>
                    <DialogDescription>
                        Select an image file to upload to your album.
                    </DialogDescription>
                </DialogHeader>
                
                <Label>Select an image file to upload</Label>
                <Input type={"file"} onChange={(e)=>handleFileChange(e)} ></Input>
                <Label>Select an album where you would add the image</Label>
                <Select 
                    name={imageFile.albumId} 
                    onValueChange={(value) => 
                        setImageFile(prev => (
                            { 
                                ...prev, 
                                albumId: value 
                            }
                        ))}
                >
                    <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select an album" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectLabel> Albums </SelectLabel>
                        {albums.length > 0 && albums?.map((album)=>(
                            <SelectItem key={album._id}value={`${album._id}`}>{album.name}</SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Label>Tags</Label>
                <Input 
                    placeholder={"tags"} 
                    name={"tags"} 
                    value={imageFile.tags} 
                    onChange={(e)=>setImageFile((prev)=>(
                        {...prev, tags: e.target.value}
                        ))}
                    ></Input>
                <Button 
                    onClick={(e)=>handleSubmit(e)} 
                    disabled={isUploading}
                >  
                    {isUploading ? "Uploading..." : "Upload"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}