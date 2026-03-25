import { Navigate } from "react-router-dom";
import { useSuperuser } from "../../context/superuser/superuserContext";

// Protects /superuser and /superuser/add-admin — must be logged in as superuser
const SuperuserRoute = ({ children }) => {
  const { isLoggedIn } = useSuperuser();
  if (!isLoggedIn) return <Navigate to="/superuser/login" replace />;
  return children;
};

export default SuperuserRoute;
