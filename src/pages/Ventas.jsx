import { useState } from "react";
import useFetch, { API } from "../hooks/useFetch";
import PageHeader from "../molecules/PageHeader";
import StateMsg from "../atoms/StateMsg";
import DataTable from "../atoms/DataTable";
import EmptyRow from "../atoms/EmptyRow";
import "../css/Ventas.css"; 

// NUEVO: Añadimos bodegaId a la línea vacía
const LINEA_VACIA = { productoId: "", bodegaId: "", nombre: "", cantidad: 1, precioUnitario: "" };

export default function Ventas() {
  const { data: ventas,   loading, error, refetch } = useFetch("/ventas");
  const { data: productos }                         = useFetch("/productos");
  const { data: stocks }                            = useFetch("/stocks");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [lineas,      setLineas]      = useState([{ ...LINEA_VACIA }]);
  const [guardando,   setGuardando]   = useState(false);
  const [errorForm,   setErrorForm]   = useState("");
  const [exito,       setExito]       = useState(false);

  // ─── Obtener bodegas que tienen stock de un producto ──────────
  function bodegasConStock(productoId) {
    if (!stocks || !productoId) return [];
    return (stocks ?? [])
      .filter(s => String(s.producto?.id) === String(productoId) && (s.cantidadDisponible ?? 0) > 0)
      .map(s => ({
        id:       s.bodega?.id,
        sucursal: s.bodega?.sucursal,
        cantidad: s.cantidadDisponible,
      }));
  }

  function abrirForm()  { setMostrarForm(true); setErrorForm(""); setExito(false); }
  function cerrarForm() {
    setMostrarForm(false);
    setLineas([{ ...LINEA_VACIA }]);
    setErrorForm("");
  }

  function handleLineaChange(i, campo, valor) {
    setLineas(prev => {
      const next = [...prev];
      if (campo === "productoId") {
        const prod = (productos ?? []).find(p => String(p.id) === String(valor));
        next[i] = {
          ...next[i],
          productoId:     valor,
          bodegaId:       "", // Resetear la bodega si se cambia el producto
          nombre:         prod?.nombre ?? "",
          precioUnitario: prod?.precioVenta != null ? String(prod.precioVenta) : "",
        };
      } else {
        next[i] = { ...next[i], [campo]: valor };
      }
      return next;
    });
  }

  function agregarLinea() { setLineas(p => [...p, { ...LINEA_VACIA }]); }
  function quitarLinea(i) { setLineas(p => p.filter((_, idx) => idx !== i)); }

  const total = lineas.reduce((acc, l) =>
    acc + (Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0), 0
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorForm("");

    if (!lineas.length)     { setErrorForm("Agrega al menos un producto.");      return; }
    for (const [i, l] of lineas.entries()) {
      if (!l.productoId)    { setErrorForm(`Línea ${i+1}: selecciona un producto.`); return; }
      if (!l.bodegaId)      { setErrorForm(`Línea ${i+1}: selecciona la bodega de origen.`); return; }
      if (l.cantidad < 1)   { setErrorForm(`Línea ${i+1}: la cantidad debe ser ≥ 1.`); return; }
      if (!l.precioUnitario || Number(l.precioUnitario) <= 0) {
        setErrorForm(`Línea ${i+1}: ingresa un precio válido.`); return;
      }
    }

    // NUEVO: La bodega ahora va en los detalles, no en la raíz del body
    const body = {
      detalles: lineas.map(l => ({
        producto:       { id: Number(l.productoId) },
        bodega:         { id: Number(l.bodegaId) },
        cantidad:       Number(l.cantidad),
        precioUnitario: Number(l.precioUnitario),
      })),
    };

    setGuardando(true);
    try {
      const res = await fetch(`${API}/ventas`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      cerrarForm();
      setExito(true);
      setTimeout(() => setExito(false), 4000);
      refetch();
    } catch (err) {
      setErrorForm(err.message || "No se pudo registrar la venta.");
    } finally {
      setGuardando(false);
    }
  }

  const fmtFecha  = f => f ? new Date(f).toLocaleString("es-CL") : "—";
  const fmtPrecio = n => `$${Number(n ?? 0).toLocaleString("es-CL")}`;

  return (
    <div className="page-wrapper">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <PageHeader 
          title="Ventas" 
          sub="El stock se descuenta automáticamente al confirmar" 
        />
        <button onClick={abrirForm} className="btn-primary">+ Nueva venta</button>
      </div>

      {exito && (
        <div className="msg-exito">✓ Venta registrada. Stock descontado correctamente.</div>
      )}

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div className="card card-form">
          <div className="card-title">
            Nueva venta
            <button onClick={cerrarForm} className="btn-close" title="Cerrar (Esc)">×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lines-section">
              <label className="form-label" style={{ marginBottom: 10 }}>
                Productos y Bodegas <Req />
              </label>

              {/* Cabecera actualizada con Bodega */}
              <div className="line-grid line-header" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 40px" }}>
                {["Producto", "Bodega Origen", "Cant.", "Precio unit.", ""].map((h, i) => (
                  <span key={i}>{h}</span>
                ))}
              </div>

              {lineas.map((l, i) => (
                <div key={i} className="line-grid" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 40px" }}>
                  
                  {/* Selector de Producto */}
                  <select 
                    value={l.productoId}
                    onChange={e => handleLineaChange(i, "productoId", e.target.value)}
                    className="form-input"
                  >
                    <option value="">— Producto —</option>
                    {(productos ?? []).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>

                  {/* NUEVO: Selector de Bodega Específico para este producto */}
                  <select 
                    value={l.bodegaId}
                    onChange={e => handleLineaChange(i, "bodegaId", e.target.value)}
                    className="form-input"
                    disabled={!l.productoId}
                  >
                    <option value="">— Seleccionar bodega —</option>
                    {bodegasConStock(l.productoId).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.sucursal} ({b.cantidad} ud. disp.)
                      </option>
                    ))}
                  </select>

                  <input 
                    type="number" min="1" value={l.cantidad}
                    onChange={e => handleLineaChange(i, "cantidad", e.target.value)}
                    className="form-input" placeholder="1" 
                  />

                  <div className="input-icon-wrapper">
                    <span className="input-icon">$</span>
                    <input 
                      type="number" min="0" step="1" value={l.precioUnitario}
                      onChange={e => handleLineaChange(i, "precioUnitario", e.target.value)}
                      className="form-input input-with-icon" placeholder="0" 
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={() => quitarLinea(i)}
                    disabled={lineas.length === 1}
                    className="btn-remove-line"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button type="button" onClick={agregarLinea} className="btn-secondary" style={{ marginTop: 4 }}>
                + Agregar producto
              </button>
            </div>

            <div className="total-box" style={{ marginTop: 20 }}>
              <span className="total-label">Total</span>
              <span className="total-value">{fmtPrecio(total)}</span>
            </div>

            {errorForm && (
              <p className="msg-error-form">⚠ {errorForm}</p>
            )}

            <div className="btn-row">
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? "Registrando…" : "Confirmar venta"}
              </button>
              <button type="button" onClick={cerrarForm} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla historial ── */}
      <div className="card">
        <div className="card-title">Historial de ventas</div>
        <StateMsg loading={loading} error={error} />
        
        {!loading && !error && (
          // Ocultamos la columna global de bodega en la tabla, ya que ahora cada detalle tiene la suya
          <DataTable headers={["#", "Fecha", "Detalle de Productos", "Total"]}>
            {(ventas ?? []).length === 0
              ? <EmptyRow cols={4} mensaje="Sin ventas registradas" />
              : (ventas ?? []).map(v => (
                  <tr key={v.id}>
                    <td className="td-mono">#{v.id}</td>
                    <td className="td-mono td-date">{fmtFecha(v.fechaVenta)}</td>
                    <td className="td-details">
                      {/* Aquí mostramos de qué bodega salió cada producto */}
                      {(v.detalles ?? []).map(d =>
                        `${d.producto?.nombre ?? "?"} ×${d.cantidad} (${d.bodega?.sucursal ?? "?"})`
                      ).join(" | ") || "—"}
                    </td>
                    <td className="td-total">
                      {fmtPrecio(v.total)}
                    </td>
                  </tr>
                ))
            }
          </DataTable>
        )}
      </div>
    </div>
  );
}

function Req() { return <span style={{ color: "var(--danger)" }}>*</span>; }