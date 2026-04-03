import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/authContext";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children, allowedRole }) => {
    const { isLoggedIn, user, isInitializing } = useAuth();
    
    if (isInitializing) {
        return <Spinner size="full" />;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace/>;
        //replace So user can't hit "back" and get stuck in a redirect loop.
    }
    if (allowedRole && user?.userType !== allowedRole) {
        return <Navigate to="/" replace/>;
    }
    return children;
}

export default ProtectedRoute;