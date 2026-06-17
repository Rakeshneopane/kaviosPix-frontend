import { Navigate } from "react-router-dom"
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../store/slices/authSlice.js"

export const ProtectedRoute = ({ children , requiredRole = null})=>{

    const { userData : user, userStatus, userError } = useSelector((state)=> {
        console.log("state from protected route ",state);
        return state.userSlice});

    const dispatch = useDispatch();

    useEffect(() => {
        const loadUser = async() =>{
            if(userStatus === "idle") {
                try {
                    await dispatch(fetchUser()).unwrap();
                } catch (error) {
                    console.log("Error from Protected route while fetching user by thunk.", error.message);
                } 
            }
        }
        loadUser();

    }, [dispatch, userStatus]);

    // console.log( userStatus, userError, user );
    if(userStatus === "loading" || userStatus === "idle"){
        console.log("userStatus: ", userStatus);
        return( <div> Loading... from protected route compo </div>)
    }
    
    if (userStatus === "error") {
        console.log("Error fetching user:", userError);
        return <Navigate to="/login" replace={true} />;
    }

    if(!user){
        console.log("rejecting from protected route.");
        return <Navigate to="/login" replace={true} />;
    }

    const userRole = user?.role || "user";
    if(userRole !== requiredRole && requiredRole){
        return <Navigate to="/unauthorized" replace={true} />;
    }

    return children;
}