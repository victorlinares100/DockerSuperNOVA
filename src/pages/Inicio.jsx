import useFetch from "../hooks/useFetch";

export default function Inicio() {
  const { data: productos }  = useFetch("/productos");
  const { data: proveedores} = useFetch("/proveedores");
  const { data: bodegas }    = useFetch("/bodegas");
  const { data: pedidos }    = useFetch("/pedidos");

  const pendientes = (pedidos ?? []).filter(
    p => p.estado?.toUpperCase() === "PENDIENTE"
  ).length;

  return (
    <>
      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)",
        padding: "56px 32px",
        color: "#fff",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>
            Dashboard Supermercado NOVA
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", maxWidth: 480 }}>
            Gestión de inventario en tiempo real — stock, proveedores, bodegas y pedidos en un solo lugar.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 0" }}>
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
            <div className="kpi-value" style={{ color: pendientes > 0 ? "var(--warn)" : undefined }}>
              {pedidos ? pendientes : "…"}
            </div>
            <div className="kpi-sub">por recibir</div>
          </div>
        </div>

        {/* Tabla resumen */}
        <div className="card">
          <div className="card-title">Últimos productos registrados</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                </tr>
              </thead>
              <tbody>
                {productos === null && (
                  <tr><td colSpan={2} className="state-msg">Cargando…</td></tr>
                )}
                {(productos ?? []).slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                    <td>{p.categoria?.Nombre_Categoria || "Sin categoría"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}