import useSuperuserApi from "../../hooks/useSuperuserApi";
import Spinner from "../Spinner";

const AdminCard = ({ admin, onDeleted }) => {
  const { executeRequest, loading } = useSuperuserApi();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete admin "${admin.firstName} ${admin.lastName}" (${admin.email})?`
    );
    if (!confirmed) return;

    const result = await executeRequest(
      `/api/superuser/delete-admin/${encodeURIComponent(admin.email)}`,
      { method: "DELETE" }
    );
    if (result.success) onDeleted(admin.email);
  };

  // Avatar initial letter
  const initial = admin.firstName?.[0]?.toUpperCase() || "A";

  return (
    <div className="bg-bg border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-primary-light text-primary font-bold text-lg flex items-center justify-center shrink-0">
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary text-sm truncate">
          {admin.firstName} {admin.lastName}
        </p>
        <p className="text-text-secondary text-xs truncate">{admin.email}</p>
      </div>

      {/* Badge */}
      <span className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary">
        Admin
      </span>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="shrink-0 px-3 py-1.5 text-xs font-semibold text-danger border border-danger rounded-lg hover:bg-danger-light disabled:opacity-50 transition-colors flex items-center gap-1"
      >
        {loading ? <><Spinner size="sm" /> Deleting…</> : "Delete"}
      </button>
    </div>
  );
};

export default AdminCard;
