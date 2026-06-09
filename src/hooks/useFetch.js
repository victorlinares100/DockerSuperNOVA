import { useState, useEffect, useCallback } from "react";

export const INVENTARIO_API = "http://localhost:8081/api/v1";
export const CLIENTE_API = "http://localhost:8082/api/v1";

export const API = INVENTARIO_API; 

export default function useFetch(endpoint) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);  

  useEffect(() => {
    setLoading(true);
    setError(null);

    let baseURL = INVENTARIO_API; // Por defecto todo va al 8081 (Inventario)
    
    // Si el endpoint tiene que ver con bodegas o solicitudes, cambiamos al 8082
    if (endpoint.startsWith("/bodegas") || endpoint.startsWith("/solicitudes")) {
        baseURL = CLIENTE_API;
    }

    fetch(baseURL + endpoint)
      .then(r => { if (!r.ok) throw new Error("Error " + r.status); return r.json(); })
      .then(d  => { setData(d);          setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [endpoint, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}