import { Navigate } from "react-router-dom";
import { useSuperuser } from "../../context/superuser/superuserContext";

// Protects /superuser/login — redirects to dashboard if already logged in
const PublicSuperuserRoute = ({ children }) => {
  const { isLoggedIn } = useSuperuser();
  if (isLoggedIn) return <Navigate to="/superuser" replace />;
  return children;
};

export default PublicSuperuserRoute;
