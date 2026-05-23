import { useState } from "react";
import useFetch from "../hooks/useFetch";

export default function Productos() {
  const { data, loading, error } = useFetch("/productos");
  const [busqueda, setBusqueda]  = useState("");

  const lista = (data ?? []).filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Productos</h1>
      <p className="page-sub">Catálogo completo de productos disponibles</p>

      <div className="card">
        <div className="toolbar">
          <input
            className="search"
            placeholder="Buscar por nombre…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {!loading && `${lista.length} producto${lista.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {loading && <p className="state-msg">Cargando productos…</p>}
        {error   && <p className="state-msg state-error">Error al cargar: {error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0
                  ? <tr><td colSpan={3} className="state-msg">Sin resultados para "{busqueda}"</td></tr>
                  : lista.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                        <td>{p.categoria?.Nombre_Categoria || "—"}</td>
                        <td style={{ color: "var(--muted)", fontSize: 13 }}>{p.descripcion || "—"}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
