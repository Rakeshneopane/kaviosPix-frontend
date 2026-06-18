import { Search, Upload, User, Menu, X, Camera, House, Image, Images  } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/store/slices/authSlice.js";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

export default function NavbarComponent(){
    const [ menuOpen, setMenuOpen ] = useState(false);
    const [ searchInput, setSearchInput ] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData: user } = useSelector((state) => state.userSlice);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate("/login");
    };

    const handleSearch = (e) => {
        if (e.key === "Enter" && searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
            setMenuOpen(false);
        }
    };

    return (
        <nav className="border-b border-border bg-background bg-gray-300 text-black shadow">
        <div className="flex px-4 h-14 gap-3 shadow items-center justify-between" >
            <Link
                to = "/" 
                className ="font-bold tracking-tight flex"
                > 
                <Camera className="h-5.5 w-5.5 mr-1.5"/>
                <span> KaviosPix </span>  
            </Link>
            
            {/* Destop links */}
            <div className="hidden md:flex"> 
                <Button asChild
                    variant="ghost" size="sm"> 
                    <Link to="/dashboard" className="flex items-center gap-1">
                        <House className="h-5.5"/>
                        Home 
                    </Link>
                </Button>
                <Button asChild
                    variant="ghost" size="sm"> 
                    <Link to="/albums" className="flex items-center gap-1">
                        <Image className="h-5.5"/> Albums    
                    </Link>
                </Button>
             </div>

            {/* Destop rights */}
            <div className="hidden md:flex items-center gap-2 ">
                {/* <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />  
                    <Input 
                        className={"pl-8 h-8 text-sm"}
                        value={searchInput}
                        placeholder="Search images..."
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>   */}
                {/* <Button size="sm"><Upload className="h-3.5 w-3.5 mr-1.5"/> Upload</Button>   */}
                <Button 
                    variant="outline" size="icon" 
                    className="h-8 w-8 rounded-full bg-gray-300"
                    onClick={() => setLogoutDialogOpen(true)}
                > 
                    <User className="text-black"/> 
                </Button>
            </div>

            {/* Mobile Hamburger */}
            <Button variant="ghost" size="icon" className={"md:hidden"}
                onClick={()=> setMenuOpen(o => !o)}>
                    {menuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
            </Button>
        </div>

        { menuOpen && (
            <div 
            className="md:hidden flex flex-col gap-1 px-5 pb-4 border-t border-border">
                {/* <div className="relative mt-3">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                        className="pl-8 w-full"
                        placeholder="Search images..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}    
                    />
                </div> */}
                <Button variant="ghost" asChild>
                    <Link to="/dashboard" className="flex items-center gap-1">
                    <House className="h-5.5"/> Home
                    </Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link to="/albums" className="flex items-center gap-1">
                        <Image className="h-5.5"/> Albums
                    </Link>                    
                </Button>
                {/* className="justify-start" */}
                <Button variant="ghost" onClick={() => setLogoutDialogOpen(true)}>
                    <User /> {user?.name?.split(" ")[0] || "Account"}
                </Button>
            </div>
        )}

            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Logout?</DialogTitle>
                        <DialogDescription>
                            Logged in as {user?.name}. Are you sure you want to log out?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </nav>
    )
} 