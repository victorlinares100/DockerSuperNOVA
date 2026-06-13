import { useState } from "react";
import useFetch, { API } from "../hooks/useFetch";
import DataTable  from "../atoms/DataTable";
import EmptyRow   from "../atoms/EmptyRow";
import StateMsg   from "../atoms/StateMsg";
import PageHeader from "../molecules/PageHeader";
import "../css/Movimientos.css";

const TIPOS = ["ENTRADA", "SALIDA", "VENTA"];

const TIPO_STYLE = {
  ENTRADA: { cls: "badge badge-ok",   icono: "↑" },
  SALIDA:  { cls: "badge badge-warn", icono: "↓" },
  VENTA:   { cls: "badge badge-info", icono: "🛒" },
};

const MOTIVOS = ["Vencido", "Dañado", "Robo", "Otro"];

const HEADERS = ["#", "Tipo", "Producto", "Bodega", "Cantidad", "Fecha", "Descripción"];

export default function Movimientos() {
  const { data, loading, error, refetch } = useFetch("/movimientosStock");
  const { data: stocks }                  = useFetch("/stocks");
  const { data: bodegas }                 = useFetch("/bodegas");

  const [filtroTipo,  setFiltroTipo]  = useState("TODOS");
  const [busqueda,    setBusqueda]    = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [stockId,     setStockId]     = useState("");
  const [cantidad,    setCantidad]    = useState("");
  const [motivo,      setMotivo]      = useState(MOTIVOS[0]);
  const [guardando,   setGuardando]   = useState(false);
  const [errorForm,   setErrorForm]   = useState("");
  const [exito,       setExito]       = useState("");

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
  };

  function cerrarForm() {
    setMostrarForm(false); setStockId(""); setCantidad("");
    setMotivo(MOTIVOS[0]); setErrorForm("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorForm("");
    if (!stockId)               { setErrorForm("Selecciona un producto/bodega."); return; }
    if (!cantidad || Number(cantidad) < 1) { setErrorForm("Ingresa una cantidad válida."); return; }

    setGuardando(true);
    try {
      const res = await fetch(
        `${API}/stocks/${stockId}/salida?cantidad=${cantidad}&motivo=${encodeURIComponent(motivo)}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(await res.text() || `Error ${res.status}`);
      cerrarForm();
      setExito("Salida registrada correctamente.");
      setTimeout(() => setExito(""), 3000);
      refetch();
    } catch (err) {
      setErrorForm(err.message || "No se pudo registrar la salida.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <PageHeader title="Historial de movimientos" sub="Entradas, salidas y ventas de stock" />
        <button onClick={() => setMostrarForm(true)} className="btn-primary">
          + Registrar salida
        </button>
      </div>

      {exito && <div className="msg-exito">✓ {exito}</div>}

      {/* ── Formulario salida ── */}
      {mostrarForm && (
        <div className="card card-form">
          <div className="card-title">
            Registrar salida de stock
            <button onClick={cerrarForm} className="btn-close">×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Producto / Bodega <span style={{ color: "var(--danger)" }}>*</span></label>
                <select value={stockId} onChange={e => setStockId(e.target.value)} className="form-input">
                  <option value="">— Seleccionar —</option>
                  {(stocks ?? []).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.producto?.nombre} — {getBodegaName(s.bodegaId)} ({s.cantidadDisponible} disp.)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Motivo <span style={{ color: "var(--danger)" }}>*</span></label>
                <select value={motivo} onChange={e => setMotivo(e.target.value)} className="form-input">
                  {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Cantidad <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="number" min="1" value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                  className="form-input" placeholder="Ej: 5" autoFocus />
              </div>
            </div>
            {errorForm && <p className="msg-error-form">⚠ {errorForm}</p>}
            <div className="btn-row">
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? "Registrando…" : "Registrar salida"}
              </button>
              <button type="button" onClick={cerrarForm} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* KPIs */}
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
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div className="toolbar">
          <input className="search" placeholder="Buscar por producto o descripción…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <div className="filtros-wrap">
            {["TODOS", ...TIPOS].map(t => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={`filtro-btn${filtroTipo === t ? " activo" : ""}`}>
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
                    const tipo   = m.tipoMovimiento?.toUpperCase();
                    const estilo = TIPO_STYLE[tipo] ?? { cls: "badge", icono: "—" };
                    const clsCant = tipo === "ENTRADA" ? "cantidad-positivo"
                                  : tipo === "SALIDA" || tipo === "VENTA" ? "cantidad-negativo"
                                  : "cantidad-neutral";
                    const prefijo = tipo === "ENTRADA" ? "+"
                                  : (tipo === "SALIDA" || tipo === "VENTA") ? "-" : "";
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