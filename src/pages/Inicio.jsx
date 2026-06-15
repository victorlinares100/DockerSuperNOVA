import { useState } from "react"; 
import "../css/Inicio.css";
import useFetch       from "../hooks/useFetch";
import DataTable      from "../atoms/DataTable";
import EmptyRow       from "../atoms/EmptyRow";
import GraficoStock   from "../components/GraficoStock"; 
import GraficoTopProductos from "../components/GraficoTopProductos";
import GraficoVentasMensual from "../components/GraficoVentasMensual";

export default function Inicio() {
  const { data: productos }  = useFetch("/productos");
  const { data: proveedores} = useFetch("/proveedores");
  const { data: bodegas }    = useFetch("/bodegas");
  const { data: pedidos }    = useFetch("/pedidos");
  const { data: stocks }     = useFetch("/stocks");
  const { data: ventas }     = useFetch("/ventas"); 
  const pendientes = (pedidos ?? []).filter(
    p => p.estado?.toUpperCase() === "PENDIENTE"
  ).length;

  const ultimos = (productos ?? []).slice(-5).reverse();

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
            <div className="kpi-sub">Bodegas Activas </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Pedidos pendientes</div>
            <div className={`kpi-value${pendientes > 0 ? " kpi-value-warn" : ""}`}>
              {pedidos ? pendientes : "…"}
            </div>
            <div className="kpi-sub">por recibir</div>
          </div>
        </div>

        {}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: 24 }}>
          
          
          {/* Gráfico 1: Ventas mensuales por categoría (BARRAS AGRUPADAS) */}
          <div className="card">
            <GraficoVentasMensual ventas={ventas} />
          </div>

          {/* Gráfico 2: Stock por categoría (BARRAS) */}
          <div className="card">
            <GraficoStock stocks={stocks} />
          </div>

        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: 24 }}>
          <div className="card">
            <GraficoTopProductos ventas={ventas} /> 
          </div>
          
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="card-title" style={{ marginBottom: "12px" }}>Últimos productos registrados</div>
              <DataTable headers={["Nombre", "Categoría"]}>
                {productos === null
                  ? <EmptyRow cols={2} mensaje="Cargando…" />
                  : ultimos.length === 0
                    ? <EmptyRow cols={2} mensaje="Sin productos registrados" />
                    : ultimos.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 500, padding: "8px 12px" }}>{p.nombre}</td>
                          <td style={{ padding: "8px 12px" }}>{p.categoria?.nombre_Categoria || "Sin categoría"}</td>
                        </tr>
                      ))
                }
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}