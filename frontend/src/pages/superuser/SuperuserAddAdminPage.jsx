import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSuperuserApi from "../../hooks/useSuperuserApi";
import Spinner from "../../components/Spinner";

const SuperuserAddAdminPage = () => {
  const { executeRequest, loading } = useSuperuserApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null); // { firstName, lastName, email }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Client-side password match check
    if (form.password !== form.confirmPassword) {
      setErrors([{ msg: "Passwords do not match" }]);
      return;
    }

    const result = await executeRequest("/api/superuser/add-admin", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (result.success) {
      setSuccess(result.data.admin);
      setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    } else if (result.data?.errors) {
      setErrors(result.data.errors);
    } else if (result.message) {
      setErrors([{ msg: result.message }]);
    }
  };

  const handleAddAnother = () => setSuccess(null);

  return (
    <div className="min-h-screen bg-bg-subtle">
      {/* ─── Top Bar ─── */}
      <header className="bg-bg border-b border-border px-6 py-3 flex items-center gap-3">
        <span className="text-xl">🛡️</span>
        <span className="font-bold text-text-primary text-lg">NoteDown</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary">
          Superuser
        </span>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          to="/superuser"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-bg border border-border shadow-md rounded-2xl p-8">
          {!success ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Add Admin</h1>
                <p className="text-text-secondary text-sm mt-1">
                  The new admin will be verified automatically and sent a welcome email.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-text-secondary">First Name</label>
                    <input name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-text-secondary">Last Name</label>
                    <input name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-text-secondary">Email</label>
                  <input name="email" type="email" placeholder="admin@example.com" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-text-secondary">Password</label>
                    <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-text-secondary">Confirm Password</label>
                    <input name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
                  </div>
                </div>

                {errors.map((err, i) => (
                  <p key={i} className="text-danger-text bg-danger-light border border-danger px-4 py-2 rounded-lg text-sm">
                    {err.msg}
                  </p>
                ))}

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm flex items-center justify-center gap-2 mt-1">
                  {loading ? <Spinner size="sm" /> : "Add Admin"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div className="text-center py-4">
              <span className="text-5xl block mb-4">✅</span>
              <h2 className="text-xl font-bold text-text-primary mb-2">Admin Added!</h2>
              <p className="text-text-secondary text-sm mb-1">
                <span className="font-semibold text-text-primary">{success.firstName} {success.lastName}</span>
              </p>
              <p className="text-text-muted text-xs mb-6">{success.email}</p>
              <p className="text-text-secondary text-sm mb-8">
                A welcome email has been sent to the new admin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleAddAnother}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold text-sm"
                >
                  + Add Another Admin
                </button>
                <Link
                  to="/superuser"
                  className="px-6 py-2.5 bg-bg border border-border text-text-primary rounded-lg hover:bg-bg-subtle transition-colors font-semibold text-sm text-center"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperuserAddAdminPage;
