import { useState, useEffect, useCallback } from "react";

export const API = "http://localhost:8080/api/v1";

export default function useFetch(endpoint) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);   // incrementar para forzar recarga

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API + endpoint)
      .then(r => { if (!r.ok) throw new Error("Error " + r.status); return r.json(); })
      .then(d  => { setData(d);          setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [endpoint, tick]);

  // Llamar refetch() después de un POST/PUT/DELETE para recargar la lista
  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}