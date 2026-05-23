import { useState, useEffect } from "react";

export const API = "http://localhost:8080/api/v1";

export default function useFetch(endpoint) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API + endpoint)
      .then(r => { if (!r.ok) throw new Error("Error " + r.status); return r.json(); })
      .then(d  => { setData(d);          setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [endpoint]);

  return { data, loading, error };
}