import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth/authContext";
import { useTheme } from "../context/themeContext";
import useApi from "../hooks/useApi";
import Spinner from "./Spinner";
import logoImg from "../assets/NoteDown_logo.png";

const Navbar = () => {
  const { isLoggedIn, user, dispatch } = useAuth();
  const { executeRequest, loading } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, handleKeyDown]);

  const handleLogout = async () => {
    const res = await executeRequest("/api/auth/logout", { method: "POST" });
    if (res.success) {
      dispatch({ type: "LOGOUT" });
      setIsMenuOpen(false);
      navigate("/");
    }
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-bg border-b border-border shadow-sm px-6 py-3 flex items-center justify-between text-text-primary transition-all duration-200">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 ...">
          <img src={logoImg} alt="NoteDown" className="h-8 w-8 rounded-full" />
          <span>NoteDown</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 font-medium text-sm">
          <NavLinks
            isLoggedIn={isLoggedIn}
            user={user}
            loading={loading}
            handleLogout={handleLogout}
          />
        </div>

        {/* Hamburger Button (mobile) */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-bg-subtle transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span
            className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-text-primary mt-1 transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-text-primary mt-1 transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </nav>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-bg border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="text-lg font-bold text-primary">📝 NoteDown</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-subtle text-text-secondary transition-colors"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex flex-col px-4 py-4 gap-1 font-medium text-sm">
          <MobileNavLinks
            isLoggedIn={isLoggedIn}
            user={user}
            loading={loading}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </>
  );
};

/* ── Theme Toggle Button ── */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '2.25rem', height: '2.25rem',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
        backgroundColor: 'transparent', color: 'var(--text-secondary)',
        transition: 'background-color 0.2s',
        flexShrink: 0,
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Sun icon — shown in dark mode */}
      <svg
        style={{
          width: '1.25rem', height: '1.25rem',
          position: 'absolute',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
          opacity: isDark ? 1 : 0,
        }}
        fill="currentColor" viewBox="0 0 20 20"
      >
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
      </svg>
      {/* Moon icon — shown in light mode */}
      <svg
        style={{
          width: '1.25rem', height: '1.25rem',
          position: 'absolute',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          transform: isDark ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)',
          opacity: isDark ? 0 : 1,
        }}
        fill="currentColor" viewBox="0 0 20 20"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
};

/* ── Desktop link list ── */
const NavLinks = ({ isLoggedIn, user, loading, handleLogout }) => {
  if (isLoggedIn) {
    return (
      <>
        <span className="text-text-secondary">
          Hello,{" "}
          <span className="font-semibold text-text-primary">
            {user?.firstName}
          </span>
          !
        </span>
        {user?.userType === "admin" && (
          <Link
            to="/admin/notes"
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
          >
            Notes Management
          </Link>
        )}
        {user?.userType === "user" && (
          <>
            <Link
              to="/upload"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Upload
            </Link>
            <Link
              to="/notes"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Notes
            </Link>
            <Link
              to="/my-notes"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              My Notes
            </Link>
          </>
        )}
        <Link
          to="/profile"
          className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          Profile
        </Link>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          disabled={loading}
          className="px-4 py-2 text-text-secondary border border-border rounded-lg hover:bg-bg-subtle hover:text-text-primary transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Spinner size="sm" /> : "Logout"}
        </button>
      </>
    );
  }

  return (
    <div className="flex gap-3 items-center">
      <ThemeToggle />
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
  );
};

/* ── Mobile link list ── */
const MobileNavLinks = ({ isLoggedIn, user, loading, handleLogout }) => {
  const { theme, toggleTheme } = useTheme();
  if (isLoggedIn) {
    return (
      <>
        <div className="px-3 py-3 mb-2 bg-bg-subtle rounded-lg">
          <p className="text-text-secondary text-xs">Signed in as</p>
          <p className="font-semibold text-text-primary text-sm">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        {user?.userType === "admin" && (
          <Link
            to="/admin/notes"
            className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
          >
            Notes Management
          </Link>
        )}
        {user?.userType === "user" && (
          <>
            <Link
              to="/upload"
              className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
            >
              📤 Upload
            </Link>
            <Link
              to="/notes"
              className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
            >
              📝 Notes
            </Link>
            <Link
              to="/my-notes"
              className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
            >
              📁 My Notes
            </Link>
          </>
        )}
        <Link
          to="/profile"
          className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
        >
          👤 Profile
        </Link>

        <div className="border-t border-border my-2" />

        {/* Theme toggle — text label in mobile drawer for clarity */}
        <button
          onClick={toggleTheme}
          className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors text-left w-full"
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors text-left disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Spinner size="sm" /> : "🚪 Logout"}
        </button>
      </>
    );
  }

  return (
    <>
      {/* Theme toggle for guests too */}
      <button
        onClick={toggleTheme}
        className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors text-left w-full"
      >
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
      <Link
        to="/login"
        className="px-3 py-3 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
      >
        🔑 Login
      </Link>
      <Link
        to="/signup"
        className="mx-3 mt-2 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm text-center"
      >
        Sign Up
      </Link>
    </>
  );
};

export default Navbar;
