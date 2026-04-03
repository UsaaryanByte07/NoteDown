import { useCallback, useState, useEffect } from "react";
const BASE_URL = import.meta.env.VITE_API_URL || '';

//useCallback Memoizes fetchData so useEffect doesn't re-run infinitely.

//useFetch is only for GET requests.
const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}${url}`, { credentials: "include"});
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error: ${res.status}`);
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

export default useFetch;
