import { useState } from "react";

// Like useApi but sends Authorization: Bearer <token> from localStorage
const useSuperuserApi = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("superuserToken");

    try {
      const isFormData = options.body instanceof FormData;
      const res = await fetch(url, {
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) {
          setError(data.message || "Validation failed.");
          return { success: false, message: data.message, data };
        }
        throw new Error(data.message || `Error: ${res.status}`);
      }
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, executeRequest };
};

export default useSuperuserApi;
