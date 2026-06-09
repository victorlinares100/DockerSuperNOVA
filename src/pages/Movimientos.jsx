import { useState }  from "react";
import useFetch      from "../hooks/useFetch";
import DataTable     from "../atoms/DataTable";
import EmptyRow      from "../atoms/EmptyRow";
import StateMsg      from "../atoms/StateMsg";
import PageHeader    from "../molecules/PageHeader";
import "../css/Movimientos.css";

const TIPOS = ["ENTRADA", "SALIDA", "VENTA", "AJUSTE"];

const TIPO_STYLE = {
  ENTRADA: { cls: "badge badge-ok",   icono: "↑" },
  SALIDA:  { cls: "badge badge-warn", icono: "↓" },
  VENTA:   { cls: "badge badge-info", icono: "🛒" },
  AJUSTE:  { cls: "badge",            icono: "⚙" },
};

const HEADERS = ["#", "Tipo", "Producto", "Bodega", "Cantidad", "Fecha", "Descripción"];

export default function Movimientos() {
  const { data, loading, error } = useFetch("/movimientosStock");
  const { data: bodegas }        = useFetch("/bodegas");

  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [busqueda,   setBusqueda]   = useState("");

  const getBodegaName = (id) => {
    const b = (bodegas ?? []).find(x => String(x.id) === String(id));
    return b ? b.sucursal : "—";
  };

  const lista = (data ?? []).filter(m => {
    const matchTipo = filtroTipo === "TODOS" || m.tipoMovimiento === filtroTipo;
    const nombreBodega = getBodegaName(m.stock?.bodegaId);
    
    const matchBusq = !busqueda ||
      m.stock?.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreBodega.toLowerCase().includes(busqueda.toLowerCase());
      
    return matchTipo && matchBusq;
  });

  const kpis = {
    ENTRADA: (data ?? []).filter(m => m.tipoMovimiento === "ENTRADA").length,
    SALIDA:  (data ?? []).filter(m => m.tipoMovimiento === "SALIDA").length,
    VENTA:   (data ?? []).filter(m => m.tipoMovimiento === "VENTA").length,
    AJUSTE:  (data ?? []).filter(m => m.tipoMovimiento === "AJUSTE").length,
  };

  return (
    <div className="page-wrapper">
      <PageHeader title="Historial de movimientos" sub="Todas las entradas, salidas, ventas y ajustes de stock" />

      {!loading && (
        <div className="kpi-grid">
          <div className="kpi-card kpi-entradas">
            <div className="kpi-label">↑ Entradas</div>
            <div className="kpi-value kpi-value-entradas">{kpis.ENTRADA}</div>
            <div className="kpi-sub">ingresos de stock</div>
          </div>
          <div className="kpi-card kpi-salidas">
            <div className="kpi-label">↓ Salidas</div>
            <div className="kpi-value kpi-value-salidas">{kpis.SALIDA}</div>
            <div className="kpi-sub">retiros de stock</div>
          </div>
          <div className="kpi-card kpi-ventas">
            <div className="kpi-label">🛒 Ventas</div>
            <div className="kpi-value kpi-value-ventas">{kpis.VENTA}</div>
            <div className="kpi-sub">productos vendidos</div>
          </div>
          <div className="kpi-card kpi-ajustes">
            <div className="kpi-label">⚙ Ajustes</div>
            <div className="kpi-value kpi-value-ajustes">{kpis.AJUSTE}</div>
            <div className="kpi-sub">correcciones manuales</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <input
            className="search"
            placeholder="Buscar por producto o descripción…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div className="filtros-wrap">
            {["TODOS", ...TIPOS].map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`filtro-btn${filtroTipo === t ? " activo" : ""}`}
              >
                {t === "TODOS" ? "Todos" : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <StateMsg loading={loading} error={error} />

        {!loading && !error && (
          <>
            <DataTable headers={HEADERS}>
              {lista.length === 0
                ? <EmptyRow cols={7} mensaje={
                    data?.length === 0
                      ? "Sin movimientos registrados aún"
                      : "Sin resultados para el filtro aplicado"
                  } />
                : [...lista].reverse().map(m => {
                    const tipo    = m.tipoMovimiento?.toUpperCase();
                    const estilo  = TIPO_STYLE[tipo] ?? { cls: "badge", icono: "—" };
                    const clsCant = tipo === "ENTRADA" ? "cantidad-positivo"
                                  : tipo === "SALIDA" || tipo === "VENTA" ? "cantidad-negativo"
                                  : "cantidad-neutral";
                    const prefijo = tipo === "ENTRADA" ? "+" : (tipo === "SALIDA" || tipo === "VENTA") ? "-" : "";

                    return (
                      <tr key={m.id}>
                        <td className="td-mono">#{m.id}</td>
                        <td>
                          <span className={estilo.cls}>
                            {estilo.icono} {tipo ? tipo.charAt(0) + tipo.slice(1).toLowerCase() : "—"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{m.stock?.producto?.nombre || "—"}</td>
                        <td className="td-muted">{getBodegaName(m.stock?.bodegaId)}</td>
                        <td><span className={clsCant}>{prefijo}{m.cantidad ?? 0}</span></td>
                        <td className="td-mono">{m.fechaMovimiento ?? "—"}</td>
                        <td className="td-muted-wrap">{m.descripcion || "—"}</td>
                      </tr>
                    );
                  })
              }
            </DataTable>
            <div className="mov-contador">
              {lista.length} movimiento{lista.length !== 1 ? "s" : ""}
              {filtroTipo !== "TODOS" && ` · filtro: ${filtroTipo}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}