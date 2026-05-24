import { useState } from "react";
import useFetch from "../hooks/useFetch";

const TIPOS = ["ENTRADA", "SALIDA", "VENTA", "AJUSTE"];

const TIPO_STYLE = {
  ENTRADA: { cls: "badge badge-ok",     icono: "↑" },
  SALIDA:  { cls: "badge badge-warn",   icono: "↓" },
  VENTA:   { cls: "badge badge-info",   icono: "🛒" },
  AJUSTE:  { cls: "badge",              icono: "⚙" },
};

export default function Movimientos() {
  const { data, loading, error } = useFetch("/movimientosStock");

  const [filtroTipo,  setFiltroTipo]  = useState("TODOS");
  const [busqueda,    setBusqueda]    = useState("");

  // ─── Filtrar lista ────────────────────────────────────────────
  const lista = (data ?? []).filter(m => {
    const matchTipo = filtroTipo === "TODOS" || m.tipoMovimiento === filtroTipo;
    const matchBusq = !busqueda ||
      m.stock?.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusq;
  });

  // ─── KPIs rápidos ─────────────────────────────────────────────
  const kpis = {
    ENTRADA: (data ?? []).filter(m => m.tipoMovimiento === "ENTRADA").length,
    SALIDA:  (data ?? []).filter(m => m.tipoMovimiento === "SALIDA").length,
    VENTA:   (data ?? []).filter(m => m.tipoMovimiento === "VENTA").length,
    AJUSTE:  (data ?? []).filter(m => m.tipoMovimiento === "AJUSTE").length,
  };

  const fmtFecha = f => f ?? "—";

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Historial de movimientos</h1>
      <p className="page-sub">Todas las entradas, salidas, ventas y ajustes de stock</p>

      {/* ── KPIs ── */}
      {!loading && (
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <div className="kpi-card" style={{ borderTopColor: "#16a34a" }}>
            <div className="kpi-label">↑ Entradas</div>
            <div className="kpi-value" style={{ color: "#16a34a" }}>{kpis.ENTRADA}</div>
            <div className="kpi-sub">ingresos de stock</div>
          </div>
          <div className="kpi-card" style={{ borderTopColor: "#f59e0b" }}>
            <div className="kpi-label">↓ Salidas</div>
            <div className="kpi-value" style={{ color: "#f59e0b" }}>{kpis.SALIDA}</div>
            <div className="kpi-sub">retiros de stock</div>
          </div>
          <div className="kpi-card" style={{ borderTopColor: "var(--accent)" }}>
            <div className="kpi-label">🛒 Ventas</div>
            <div className="kpi-value" style={{ color: "var(--accent)" }}>{kpis.VENTA}</div>
            <div className="kpi-sub">productos vendidos</div>
          </div>
          <div className="kpi-card" style={{ borderTopColor: "var(--muted)" }}>
            <div className="kpi-label">⚙ Ajustes</div>
            <div className="kpi-value" style={{ color: "var(--muted)" }}>{kpis.AJUSTE}</div>
            <div className="kpi-sub">correcciones manuales</div>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="card">
        {/* Toolbar */}
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <input
            className="search"
            placeholder="Buscar por producto o descripción…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {/* Filtro por tipo */}
          <div style={{ display: "flex", gap: 6 }}>
            {["TODOS", ...TIPOS].map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                style={{
                  padding: "6px 12px", fontSize: 12, fontWeight: 500,
                  borderRadius: "var(--radius)", cursor: "pointer",
                  fontFamily: "var(--font)",
                  background: filtroTipo === t ? "var(--navy)" : "transparent",
                  color:      filtroTipo === t ? "#fff" : "var(--muted)",
                  border:     filtroTipo === t ? "1px solid var(--navy)" : "1px solid var(--border)",
                  transition: "all .15s",
                }}
              >
                {t === "TODOS" ? "Todos" : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="state-msg">Cargando movimientos…</p>}
        {error   && <p className="state-msg state-error">Error: {error}</p>}

        {!loading && !error && (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Bodega</th>
                    <th>Cantidad</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="state-msg">
                        {data?.length === 0
                          ? "Sin movimientos registrados aún"
                          : "Sin resultados para el filtro aplicado"}
                      </td>
                    </tr>
                  ) : (
                    // Ordenar del más reciente al más antiguo
                    [...lista].reverse().map(m => {
                      const tipo   = m.tipoMovimiento?.toUpperCase();
                      const estilo = TIPO_STYLE[tipo] ?? { cls: "badge", icono: "—" };
                      const esPositivo = tipo === "ENTRADA";
                      const esNegativo = tipo === "SALIDA" || tipo === "VENTA";

                      return (
                        <tr key={m.id}>
                          <td className="td-mono">#{m.id}</td>
                          <td>
                            <span className={estilo.cls}>
                              {estilo.icono} {tipo
                                ? tipo.charAt(0) + tipo.slice(1).toLowerCase()
                                : "—"}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {m.stock?.producto?.nombre || "—"}
                          </td>
                          <td style={{ color: "var(--muted)", fontSize: 13 }}>
                            {m.stock?.bodega?.sucursal || "—"}
                          </td>
                          <td>
                            <span style={{
                              fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600,
                              color: esPositivo ? "#16a34a" : esNegativo ? "#ef4444" : "var(--text)",
                            }}>
                              {esPositivo ? "+" : esNegativo ? "-" : ""}{m.cantidad ?? 0}
                            </span>
                          </td>
                          <td className="td-mono">{fmtFecha(m.fechaMovimiento)}</td>
                          <td style={{ color: "var(--muted)", fontSize: 13, maxWidth: 200 }}>
                            {m.descripcion || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
              {lista.length} movimiento{lista.length !== 1 ? "s" : ""}
              {filtroTipo !== "TODOS" && ` · filtro: ${filtroTipo}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}