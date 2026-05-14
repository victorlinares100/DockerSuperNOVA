import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:8080/api/v1";

// ─── Hook reutilizable para fetch ─────────────────────────────────────────────
function useFetch(endpoint) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API + endpoint)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d  => { setData(d);   setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [endpoint]);

  return { data, loading, error };
}

// ─── Badge de estado ──────────────────────────────────────────────────────────
function Badge({ tipo }) {
  const map = {
    PENDIENTE:   ["badge badge-warn",   "Pendiente"],
    RECIBIDO:    ["badge badge-ok",     "Recibido"],
    "EN CAMINO": ["badge badge-info",   "En camino"],
    CANCELADO:   ["badge badge-danger", "Cancelado"],
  };
  const [cls, label] = map[tipo?.toUpperCase()] ?? ["badge badge-info", tipo ?? "—"];
  return <span className={cls}>{label}</span>;
}

// ─── Sección: Inicio ──────────────────────────────────────────────────────────
function Inicio() {
  const { data: productos }  = useFetch("/productos");
  const { data: proveedores} = useFetch("/proveedores");
  const { data: bodegas }    = useFetch("/bodegas");
  const { data: pedidos }    = useFetch("/pedidos");

  const pendientes = (pedidos ?? []).filter(
    p => p.estado?.toUpperCase() === "PENDIENTE"
  ).length;

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Resumen general del inventario</p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Productos</div>
          <div className="kpi-value">{productos ? productos.length : "…"}</div>
          <div className="kpi-sub">en catálogo</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Proveedores</div>
          <div className="kpi-value">{proveedores ? proveedores.length : "…"}</div>
          <div className="kpi-sub">registrados</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Bodegas</div>
          <div className="kpi-value">{bodegas ? bodegas.length : "…"}</div>
          <div className="kpi-sub">sucursales activas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pedidos pendientes</div>
          <div className="kpi-value">{pedidos ? pendientes : "…"}</div>
          <div className="kpi-sub">por recibir</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Últimos productos registrados</div>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
            {(productos ?? []).slice(0, 5).map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                <td>{p.categoria?.Nombre_Categoria || "Sin categoría"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Sección: Productos ───────────────────────────────────────────────────────
function Productos() {
  const { data, loading, error } = useFetch("/productos");
  const [busqueda, setBusqueda]  = useState("");

  const lista = (data ?? []).filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <h1 className="page-title">Productos</h1>
      <p className="page-sub">Catálogo completo</p>

      <div className="card">
        <input
          className="search"
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        {loading && <p className="state-msg">Cargando productos…</p>}
        {error   && <p className="state-msg" style={{ color: "var(--danger)" }}>Error: {error}</p>}

        {!loading && !error && (
          <>
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
                  ? <tr><td colSpan={3} className="state-msg">Sin resultados</td></tr>
                  : lista.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                        <td>{p.categoria?.Nombre_Categoria || "—"}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>
                          {p.descripcion || "—"}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
              {lista.length} producto{lista.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Sección: Categorías ──────────────────────────────────────────────────────
function Categorias() {
  const { data, loading, error } = useFetch("/categorias");

  return (
    <>
      <h1 className="page-title">Categorías</h1>
      <p className="page-sub">Categorías de productos disponibles</p>

      <div className="card">
        {loading && <p className="state-msg">Cargando…</p>}
        {error   && <p className="state-msg" style={{ color: "var(--danger)" }}>Error: {error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr><th>#</th><th>Nombre</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map(c => (
                <tr key={c.id}>
                  <td className="td-mono">{c.id}</td>
                  <td style={{ fontWeight: 500 }}>{c.Nombre_Categoria}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ─── Sección: Proveedores ─────────────────────────────────────────────────────
function Proveedores() {
  const { data, loading, error } = useFetch("/proveedores");

  const colores = [
    { bg: "#eef2fd", fg: "#1a4fd6" },
    { bg: "#dcfce7", fg: "#166534" },
    { bg: "#fef9c3", fg: "#854d0e" },
    { bg: "#fee2e2", fg: "#991b1b" },
    { bg: "#f3e8ff", fg: "#6b21a8" },
  ];

  return (
    <>
      <h1 className="page-title">Proveedores</h1>
      <p className="page-sub">Empresas que abastecen el supermercado</p>

      {loading && <p className="state-msg">Cargando…</p>}
      {error   && <p className="state-msg" style={{ color: "var(--danger)" }}>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {(data ?? []).map((pr, i) => {
          const { bg, fg } = colores[i % colores.length];
          const iniciales = (pr.rutEmpresa ?? "??").slice(0, 2).toUpperCase();
          return (
            <div key={pr.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: bg, color: fg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 13, flexShrink: 0
                }}>
                  {iniciales}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {pr.descripcion || "Proveedor " + pr.id}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    RUT: {pr.rutEmpresa || "—"}
                  </div>
                  <div style={{
                    marginTop: 10, display: "flex",
                    flexDirection: "column", gap: 4,
                    fontSize: 12, color: "var(--muted)"
                  }}>
                    <span>✉️ {pr.email || "—"}</span>
                    <span>📞 {pr.telefono || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Sección: Bodegas ─────────────────────────────────────────────────────────
function Bodegas() {
  const { data, loading, error } = useFetch("/bodegas");

  return (
    <>
      <h1 className="page-title">Bodegas</h1>
      <p className="page-sub">Sucursales y puntos de almacenamiento</p>

      {loading && <p className="state-msg">Cargando…</p>}
      {error   && <p className="state-msg" style={{ color: "var(--danger)" }}>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {(data ?? []).map(b => (
          <div key={b.id} className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 28 }}></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{b.sucursal}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                  {b.direccion}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Sección: Pedidos ─────────────────────────────────────────────────────────
function Pedidos() {
  const { data, loading, error } = useFetch("/pedidos");

  const fmt = fecha =>
    fecha ? new Date(fecha).toLocaleDateString("es-CL") : "—";

  return (
    <>
      <h1 className="page-title">Pedidos a proveedores</h1>
      <p className="page-sub">Órdenes de compra registradas</p>

      <div className="card">
        {loading && <p className="state-msg">Cargando…</p>}
        {error   && <p className="state-msg" style={{ color: "var(--danger)" }}>Error: {error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Proveedor</th>
                <th>Fecha emisión</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0
                ? <tr><td colSpan={5} className="state-msg">Sin pedidos registrados</td></tr>
                : (data ?? []).map(p => (
                    <tr key={p.id}>
                      <td className="td-mono">#{p.id}</td>
                      <td style={{ fontWeight: 500 }}>
                        {p.proveedor?.descripcion || "Proveedor " + (p.proveedor?.id ?? "—")}
                      </td>
                      <td>{fmt(p.fechaEmision)}</td>
                      <td className="td-mono">
                        ${(p.total ?? 0).toLocaleString("es-CL")}
                      </td>
                      <td><Badge tipo={p.estado} /></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ─── App principal ────────────────────────────────────────────────────────────
const SECCIONES = [
  { id: "inicio",      label: "Inicio",      icono: "🏠" },
  { id: "productos",   label: "Productos",   icono: "📦" },
  { id: "categorias",  label: "Categorías",  icono: "🏷️"  },
  { id: "proveedores", label: "Proveedores", icono: "🚚" },
  { id: "bodegas",     label: "Bodegas",     icono: "🏪" },
  { id: "pedidos",     label: "Pedidos",     icono: "📋" },
];

export default function App() {
  const [activa, setActiva] = useState("inicio");

  const renderSeccion = () => {
    switch (activa) {
      case "inicio":      return <Inicio />;
      case "productos":   return <Productos />;
      case "categorias":  return <Categorias />;
      case "proveedores": return <Proveedores />;
      case "bodegas":     return <Bodegas />;
      case "pedidos":     return <Pedidos />;
      default:            return <Inicio />;
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Super<span>NOVA</span>
        </div>
        {SECCIONES.map(s => (
          <button
            key={s.id}
            className={"nav-btn" + (activa === s.id ? " active" : "")}
            onClick={() => setActiva(s.id)}
          >
            <span className="nav-icon">{s.icono}</span>
            {s.label}
          </button>
        ))}
      </aside>

      <main className="main">
        {renderSeccion()}
      </main>
    </div>
  );
}