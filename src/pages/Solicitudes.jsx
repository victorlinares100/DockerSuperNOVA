import useFetch, { API, CLIENTE_API } from "../hooks/useFetch";
import { useState } from "react";
import PageHeader from "../molecules/PageHeader";
import StateMsg   from "../atoms/StateMsg";
import DataTable  from "../atoms/DataTable";
import EmptyRow   from "../atoms/EmptyRow";

const ESTADO_STYLE = {
  PENDIENTE: "badge badge-warn",
  REVISADA:  "badge badge-info",
  RESUELTA:  "badge badge-ok",
};

const TIPO_STYLE = {
  CONSULTA:   "badge badge-info",
  RECLAMO:    "badge badge-danger",
  SUGERENCIA: "badge badge-ok",
};

const HEADERS = ["#", "Nombre", "Email", "Teléfono", "Tipo", "Mensaje", "Fecha", "Estado", "Acciones"];

export default function Solicitudes() {
  const { data, loading, error, refetch } = useFetch("/solicitudes");
  const [cambiando, setCambiando] = useState(null);
  const [exito,     setExito]     = useState("");

  const fmtFecha = f => f ? new Date(f).toLocaleString("es-CL") : "—";

  async function cambiarEstado(sol, nuevoEstado) {
  try {
    const res = await fetch(`${CLIENTE_API}/solicitudes/${sol.id}`, {  // ← CLIENTE_API en vez de API
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...sol, estado: nuevoEstado }),
    });
    if (!res.ok) throw new Error();
    setCambiando(null);
    setExito(`Solicitud #${sol.id} actualizada.`);
    setTimeout(() => setExito(""), 3000);
    refetch();
  } catch {
    setCambiando(null);
  }
  }

  // Contadores
  const pendientes = (data ?? []).filter(s => s.estado === "PENDIENTE").length;
  const revisadas  = (data ?? []).filter(s => s.estado === "REVISADA").length;
  const resueltas  = (data ?? []).filter(s => s.estado === "RESUELTA").length;

  return (
    <div className="page-wrapper">
      <PageHeader title="Solicitudes de clientes" sub="Consultas, reclamos y sugerencias recibidas" />

      {exito && (
        <div style={{ background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid #86efac", borderRadius: "var(--radius)", padding: "10px 16px", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          ✓ {exito}
        </div>
      )}

      {/* KPIs */}
      {!loading && (
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <div className="kpi-card">
            <div className="kpi-label">Total solicitudes</div>
            <div className="kpi-value">{(data ?? []).length}</div>
            <div className="kpi-sub">recibidas</div>
          </div>
          <div className="kpi-card" style={{ borderTopColor: "#f59e0b" }}>
            <div className="kpi-label">Pendientes</div>
            <div className="kpi-value" style={{ color: "#f59e0b" }}>{pendientes}</div>
            <div className="kpi-sub">por revisar</div>
          </div>
          <div className="kpi-card" style={{ borderTopColor: "var(--accent)" }}>
            <div className="kpi-label">Revisadas</div>
            <div className="kpi-value" style={{ color: "var(--accent)" }}>{revisadas}</div>
            <div className="kpi-sub">en proceso</div>
          </div>
          <div className="kpi-card" style={{ borderTopColor: "#16a34a" }}>
            <div className="kpi-label">Resueltas</div>
            <div className="kpi-value" style={{ color: "#16a34a" }}>{resueltas}</div>
            <div className="kpi-sub">completadas</div>
          </div>
        </div>
      )}

      <div className="card">
        <StateMsg loading={loading} error={error} />

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {HEADERS.map((h, i) => <th key={i}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(data ?? []).length === 0
                  ? <EmptyRow cols={9} mensaje="Sin solicitudes registradas" />
                  : [...(data ?? [])].reverse().map(s => (
                      <tr key={s.id}>
                        <td className="td-mono">#{s.id}</td>
                        <td style={{ fontWeight: 500 }}>{s.nombre}</td>
                        <td className="td-mono" style={{ fontSize: 12 }}>{s.email}</td>
                        <td style={{ color: "var(--muted)", fontSize: 13 }}>{s.telefono || "—"}</td>
                        <td>
                          <span className={TIPO_STYLE[s.tipo] ?? "badge badge-info"}>
                            {s.tipo}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 200 }}>
                          {s.mensaje}
                        </td>
                        <td className="td-mono" style={{ fontSize: 12 }}>
                          {fmtFecha(s.fechaSolicitud)}
                        </td>
                        <td>
                          {cambiando === s.id ? (
                            <select
                              defaultValue={s.estado}
                              autoFocus
                              onChange={e => cambiarEstado(s, e.target.value)}
                              onBlur={() => setCambiando(null)}
                              style={{ padding: "4px 8px", borderRadius: "var(--radius)", border: "1px solid var(--border)", fontSize: 12, fontFamily: "var(--font)", background: "var(--bg)" }}
                            >
                              <option value="PENDIENTE">PENDIENTE</option>
                              <option value="REVISADA">REVISADA</option>
                              <option value="RESUELTA">RESUELTA</option>
                            </select>
                          ) : (
                            <span className={ESTADO_STYLE[s.estado] ?? "badge badge-info"}>
                              {s.estado}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => setCambiando(cambiando === s.id ? null : s.id)}
                            style={{ padding: "5px 10px", fontSize: 12, fontWeight: 500, background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid #bfdbfe", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "var(--font)" }}
                          >
                            Estado
                          </button>
                        </td>
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