import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/authContext";
import Spinner from "./Spinner";

const PublicRoute = ({ children }) => {
  const { isLoggedIn, isInitializing } = useAuth();
  
  if (isInitializing) {
    return <Spinner size="full" />;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PublicRoute;
