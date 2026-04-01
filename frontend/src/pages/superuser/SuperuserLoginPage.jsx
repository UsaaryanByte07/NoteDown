import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSuperuser } from "../../context/superuser/superuserContext";
import useSuperuserApi from "../../hooks/useSuperuserApi";
import Spinner from "../../components/Spinner";

const SuperuserLoginPage = () => {
  const { dispatch } = useSuperuser();
  const { executeRequest, loading, error } = useSuperuserApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ superuserId: "", superuserPassword: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await executeRequest("/api/superuser/login", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (result.success) {
      localStorage.setItem("superuserToken", result.data.token);
      dispatch({ type: "LOGIN", payload: { superuser: result.data.superuser } });
      navigate("/superuser");
    }
  };

  return (
    <div className="min-h-screen bg-bg-subtle flex items-center justify-center px-4">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-7">
          <span className="text-4xl block mb-3">🛡️</span>
          <h1 className="text-2xl font-bold text-text-primary">Superuser Access</h1>
          <p className="text-text-secondary text-sm mt-1">Restricted area — authorised personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Superuser ID</label>
            <input
              name="superuserId"
              type="text"
              placeholder="Enter your ID"
              value={form.superuserId}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <input
              name="superuserPassword"
              type="password"
              placeholder="••••••••"
              value={form.superuserPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {error && (
            <p className="text-danger-text bg-danger-light border border-danger px-4 py-2 rounded-lg text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperuserLoginPage;
