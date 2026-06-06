import { useState } from "react";
import useFetch from "../hooks/useFetch";
import PageHeader from "../molecules/PageHeader";
import StateMsg   from "../atoms/StateMsg";
import DataTable  from "../atoms/DataTable";
import EmptyRow   from "../atoms/EmptyRow";

const TABS = [
  { id: "categorias",  label: "Categorías",  icono: "🏷️"  },
  { id: "proveedores", label: "Proveedores", icono: "🚚" },
  { id: "bodegas",     label: "Bodegas",     icono: "🏪" },
];

// ─── Categorías ───────────────────────────────────────────────
function Categorias() {
  const { data, loading, error } = useFetch("/categorias");
  return (
    <div className="card">
      <StateMsg loading={loading} error={error} />
      {!loading && !error && (
        <DataTable headers={["#", "Nombre de categoría"]}>
          {(data ?? []).length === 0
            ? <EmptyRow cols={2} mensaje="Sin categorías registradas" />
            : (data ?? []).map(c => (
                <tr key={c.id}>
                  <td className="td-mono">{c.id}</td>
                  <td style={{ fontWeight: 500 }}>{c.Nombre_Categoria}</td>
                </tr>
              ))
          }
        </DataTable>
      )}
    </div>
  );
}

// ─── Proveedores ──────────────────────────────────────────────
function Proveedores() {
  const { data, loading, error } = useFetch("/proveedores");

  const COLORES = [
    { bg: "#dbeafe", fg: "#1e40af" },
    { bg: "#dcfce7", fg: "#166534" },
    { bg: "#fef9c3", fg: "#854d0e" },
    { bg: "#fee2e2", fg: "#991b1b" },
    { bg: "#f3e8ff", fg: "#6b21a8" },
  ];

  return (
    <>
      <StateMsg loading={loading} error={error} />
      {!loading && !error && (
        <div className="cards-grid">
          {(data ?? []).length === 0
            ? <p className="state-msg">Sin proveedores registrados</p>
            : (data ?? []).map((pr, i) => {
                const { bg, fg } = COLORES[i % COLORES.length];
                const iniciales = (pr.rutEmpresa ?? "??").slice(0, 2).toUpperCase();
                return (
                  <div key={pr.id} className="info-card">
                    <div className="avatar" style={{ background: bg, color: fg }}>
                      {iniciales}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="info-card-name">{pr.descripcion || "Proveedor " + pr.id}</div>
                      <div className="info-card-sub">RUT: {pr.rutEmpresa || "—"}</div>
                      <div className="info-card-meta">
                        <span>✉️ {pr.email    || "—"}</span>
                        <span>📞 {pr.telefono || "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}
    </>
  );
}

// ─── Bodegas ──────────────────────────────────────────────────
function Bodegas() {
  const { data, loading, error } = useFetch("/bodegas");
  return (
    <>
      <StateMsg loading={loading} error={error} />
      {!loading && !error && (
        <div className="cards-grid">
          {(data ?? []).length === 0
            ? <p className="state-msg">Sin bodegas registradas</p>
            : (data ?? []).map(b => (
                <div key={b.id} className="info-card">
                  <div className="avatar" style={{ background: "#dbeafe", color: "#1e40af", fontSize: 20 }}>
                    🏪
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="info-card-name">{b.sucursal}</div>
                    <div className="info-card-sub" style={{ marginTop: 6 }}>
                      📍 {b.direccion}
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
      )}
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────
export default function Configuracion() {
  const [tab, setTab] = useState("categorias");

  const renderTab = () => {
    switch (tab) {
      case "categorias":  return <Categorias />;
      case "proveedores": return <Proveedores />;
      case "bodegas":     return <Bodegas />;
      default:            return <Categorias />;
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader title="Configuración" sub="Categorías, proveedores y bodegas del sistema" />

      {/* Pestañas */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20,
        borderBottom: "1px solid var(--border)", paddingBottom: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "9px 18px",
              border: "none",
              borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              background: "transparent",
              fontSize: 14,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "var(--accent)" : "var(--muted)",
              fontFamily: "var(--font)",
              cursor: "pointer",
              transition: "color .15s",
              marginBottom: -1,
            }}
          >
            {t.icono} {t.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      {renderTab()}
    </div>
  );
}
