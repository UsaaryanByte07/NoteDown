import { useState } from "react";

// WHY no useEffect? Mutations (POST/PUT/DELETE) are triggered by USER ACTIONS,
// not automatically when the component mounts. So we return an execute() function.

//useApi is a custom hook for making API requests (POST, PUT, DELETE).

const useApi = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = options.body instanceof FormData;
      const res = await fetch(url, {
        credentials: "include",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        ...options,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) {
          setError(data.message || "Validation failed.");
          return { success: false, message: data.message, data };
        }
        throw new Error(data.message || `Something went wrong: ${res.status}`);
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

export default useApi;