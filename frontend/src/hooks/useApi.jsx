import { useState } from "react";

// WHY no useEffect? Mutations (POST/PUT/DELETE) are triggered by USER ACTIONS,
// not automatically when the component mounts. So we return an execute() function.

// useApi is a custom hook for making API requests (POST, PUT, DELETE).
// IMPORTANT: This hook NEVER throws. It always returns { success, data } so
// callers can do result.data?.message, result.data?.cooldownRemaining, etc.
// safely without try/catch at the call site.

const useApi = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState(null);

  const executeRequest = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    setStatusCode(null);

    try {
      const isFormData = options.body instanceof FormData;
      const res = await fetch(url, {
        credentials: "include",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        ...options,
      });

      // Always parse JSON — even on error responses (429, 423, 401, etc.)
      // so callers can access result.data.cooldownRemaining, result.data.locked, etc.
      const data = await res.json().catch(() => ({}));

      setStatusCode(res.status);

      if (!res.ok) {
        // For validation errors (data.errors array), expose the summary message
        const msg = data.message || `Something went wrong (${res.status})`;
        setError(msg);
        // Always return data so components can branch on data.locked, data.cooldownRemaining, etc.
        return { success: false, data };
      }

      return { success: true, data };
    } catch (err) {
      // Network failure — no response at all
      const msg = "Network error. Please check your connection.";
      setError(msg);
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, statusCode, executeRequest };
};

export default useApi;