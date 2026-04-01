import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSuperuser } from "../../context/superuser/superuserContext";
import useSuperuserApi from "../../hooks/useSuperuserApi";
import AdminCard from "../../components/superuser/AdminCard";
import Spinner from "../../components/Spinner";

const SuperuserHomePage = () => {
  const { superuser, dispatch } = useSuperuser();
  const { executeRequest, loading, error } = useSuperuserApi();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      const result = await executeRequest("/api/superuser/admins");
      if (result.success) setAdmins(result.data.admins);
      setFetching(false);
    };
    fetchAdmins();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("superuserToken");
    dispatch({ type: "LOGOUT" });
    navigate("/superuser/login");
  };

  const handleAdminDeleted = (deletedEmail) => {
    setAdmins((prev) => prev.filter((a) => a.email !== deletedEmail));
  };

  return (
    <div className="min-h-screen bg-bg-subtle">
      {/* ─── Top Bar ─── */}
      <header className="bg-bg border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <span className="font-bold text-text-primary text-lg">NoteDown</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary ml-1">
            Superuser
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary hidden sm:inline">
            {superuser?.superuserFirstName} {superuser?.superuserLastName}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-subtle hover:text-text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Management</h1>
            <p className="text-text-secondary text-sm mt-0.5">
              {admins.length} admin{admins.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <Link
            to="/superuser/add-admin"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold text-sm shadow-sm"
          >
            + Add Admin
          </Link>
        </div>

        {/* Admin List */}
        {fetching ? (
          <Spinner size="md" />
        ) : error ? (
          <p className="text-danger-text bg-danger-light border border-danger px-4 py-3 rounded-lg text-sm">
            {error}
          </p>
        ) : admins.length === 0 ? (
          <div className="text-center py-16 bg-bg border border-border rounded-2xl">
            <span className="text-4xl block mb-3">👤</span>
            <p className="text-text-primary font-semibold mb-1">No admins yet</p>
            <p className="text-text-secondary text-sm mb-5">Add the first admin to get started.</p>
            <Link
              to="/superuser/add-admin"
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold text-sm"
            >
              Add Admin
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {admins.map((admin) => (
              <AdminCard key={admin.email} admin={admin} onDeleted={handleAdminDeleted} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperuserHomePage;
