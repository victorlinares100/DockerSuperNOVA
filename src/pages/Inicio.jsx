import "../css/Inicio.css";
import useFetch       from "../hooks/useFetch";
import DataTable      from "../atoms/DataTable";
import EmptyRow       from "../atoms/EmptyRow";
import GraficoStock   from "../components/GraficoStock";

export default function Inicio() {
  const { data: productos }  = useFetch("/productos");
  const { data: proveedores} = useFetch("/proveedores");
  const { data: bodegas }    = useFetch("/bodegas");
  const { data: pedidos }    = useFetch("/pedidos");
  const { data: stocks }     = useFetch("/stocks");

  const pendientes = (pedidos ?? []).filter(
    p => p.estado?.toUpperCase() === "PENDIENTE"
  ).length;

  const ultimos = (productos ?? []).slice(0, 5);

  return (
    <>
      {/* Hero banner */}
      <div className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Dashboard Supermercado NOVA</h1>
          <p className="hero-sub">
            Gestión de inventario en tiempo real — stock, proveedores, bodegas y pedidos en un solo lugar.
          </p>
        </div>
      </div>

      {/* KPIs + contenido */}
      <div className="inicio-body">

        {/* KPIs */}
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
            <div className={`kpi-value${pendientes > 0 ? " kpi-value-warn" : ""}`}>
              {pedidos ? pendientes : "…"}
            </div>
            <div className="kpi-sub">por recibir</div>
          </div>
        </div>

        {/* Gráfico de stock por categoría */}
        <div className="card" style={{ marginBottom: 24 }}>
          <GraficoStock stocks={stocks} />
        </div>

        {/* Tabla últimos productos */}
        <div className="card">
          <div className="card-title">Últimos productos registrados</div>
          <DataTable headers={["Nombre", "Categoría"]}>
            {productos === null
              ? <EmptyRow cols={2} mensaje="Cargando…" />
              : ultimos.length === 0
                ? <EmptyRow cols={2} mensaje="Sin productos registrados" />
                : ultimos.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                      <td>{p.categoria?.Nombre_Categoria || "Sin categoría"}</td>
                    </tr>
                  ))
            }
          </DataTable>
        </div>

      </div>
    </>
  );
}