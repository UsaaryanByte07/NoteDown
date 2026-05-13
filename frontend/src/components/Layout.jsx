import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Spinner from "./Spinner";
import { useAuth } from "../context/auth/authContext";

const Layout = () => {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <Spinner size="full" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
