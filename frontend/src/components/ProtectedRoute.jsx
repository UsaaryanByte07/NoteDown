import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/authContext";

const ProtectedRoute = ({ children, allowedRole }) => {
    const { isLoggedIn, user } = useAuth();
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