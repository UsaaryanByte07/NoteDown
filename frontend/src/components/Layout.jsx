import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import { useAuth } from "../context/auth/authContext";

const Layout = () => {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <Spinner size="full" />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
