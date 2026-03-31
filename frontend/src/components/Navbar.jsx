import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/authContext";
import useApi from "../hooks/useApi";

const Navbar = () => {
  const { isLoggedIn, user, dispatch } = useAuth();
  const { executeRequest } = useApi();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await executeRequest("/api/auth/logout", { method: "POST" });
    if (res.success) {
      dispatch({ type: "LOGOUT" });
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-bg border-b border-border shadow-sm px-6 py-3 flex items-center justify-between text-text-primary transition-all duration-200">
      {/* Brand */}
      <Link
        to="/"
        className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
      >
        📝 NoteDown
      </Link>

      {/* Nav Actions */}
      <div className="flex items-center gap-4 font-medium text-sm">
        {isLoggedIn ? (
          <>
            <span className="hidden sm:inline text-text-secondary">
              Hello,{" "}
              <span className="font-semibold text-text-primary">
                {user?.firstName}
              </span>
              !
            </span>
            {user?.userType === "admin" && (
              <Link
                to="/admin/pending"
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                Pending Notes
              </Link>
            )}
            {user?.userType === "user" && (
              <Link
                to="/upload"
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                Upload
              </Link>
            )}
            <Link
              to="/notes"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Notes
            </Link>
            {user?.userType === "user" && (
              <Link
                to="/my-notes"
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                My Notes
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-text-secondary border border-border rounded-lg hover:bg-bg-subtle hover:text-text-primary transition-colors font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-3 items-center">
            <Link
              to="/login"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
