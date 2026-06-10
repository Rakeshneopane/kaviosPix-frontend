import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const GoogleCallbackPage = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Seedha dashboard bhejo - ProtectedRoute handle kar lega fetching
        navigate("/dashboard", { replace: true });
    }, [navigate]);
    
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="text-lg">Logging you in...</p>
            </div>
        </div>
    );
};