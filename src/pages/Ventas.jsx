import { useState } from "react";
import useFetch, { API } from "../hooks/useFetch";

const LINEA_VACIA = { productoId: "", nombre: "", cantidad: 1, precioUnitario: "" };

export default function Ventas() {
  const { data: ventas,   loading, error, refetch } = useFetch("/ventas");
  const { data: productos }                         = useFetch("/productos");
  const { data: bodegas }                           = useFetch("/bodegas");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [bodegaId,    setBodegaId]    = useState("");
  const [lineas,      setLineas]      = useState([{ ...LINEA_VACIA }]);
  const [guardando,   setGuardando]   = useState(false);
  const [errorForm,   setErrorForm]   = useState("");
  const [exito,       setExito]       = useState(false);

  function abrirForm()  { setMostrarForm(true); setErrorForm(""); setExito(false); }
  function cerrarForm() {
    setMostrarForm(false);
    setBodegaId("");
    setLineas([{ ...LINEA_VACIA }]);
    setErrorForm("");
  }

  function handleLineaChange(i, campo, valor) {
    setLineas(prev => {
      const next = [...prev];
      if (campo === "productoId") {
        // Autocompletar precio desde el producto seleccionado
        const prod = (productos ?? []).find(p => String(p.id) === String(valor));
        next[i] = {
          ...next[i],
          productoId:     valor,
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

    if (!bodegaId)          { setErrorForm("Selecciona una bodega.");            return; }
    if (!lineas.length)     { setErrorForm("Agrega al menos un producto.");      return; }
    for (const [i, l] of lineas.entries()) {
      if (!l.productoId)    { setErrorForm(`Línea ${i+1}: selecciona un producto.`);    return; }
      if (l.cantidad < 1)   { setErrorForm(`Línea ${i+1}: la cantidad debe ser ≥ 1.`); return; }
      if (!l.precioUnitario || Number(l.precioUnitario) <= 0) {
        setErrorForm(`Línea ${i+1}: ingresa un precio válido.`); return;
      }
    }

    const body = {
      bodega:   { id: Number(bodegaId) },
      detalles: lineas.map(l => ({
        producto:       { id: Number(l.productoId) },
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
        <div>
          <h1 className="page-title">Ventas</h1>
          <p className="page-sub">El stock se descuenta automáticamente al confirmar</p>
        </div>
        <button onClick={abrirForm} style={btnPrimary}>+ Nueva venta</button>
      </div>

      {exito && (
        <div style={exitoStyle}>✓ Venta registrada. Stock descontado correctamente.</div>
      )}

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div className="card" style={{ borderColor: "var(--accent)", borderWidth: 1.5, marginBottom: 24 }}>
          <div className="card-title">
            Nueva venta
            <button onClick={cerrarForm} style={closeBtn}>×</button>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Bodega */}
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Bodega <Req /></label>
              <select value={bodegaId} onChange={e => setBodegaId(e.target.value)}
                style={{ ...inp, maxWidth: 280, marginTop: 6 }}>
                <option value="">— Seleccionar bodega —</option>
                {(bodegas ?? []).map(b => (
                  <option key={b.id} value={b.id}>{b.sucursal}</option>
                ))}
              </select>
            </div>

            {/* Líneas */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lbl, display: "block", marginBottom: 10 }}>
                Productos <Req />
              </label>

              {/* Cabecera */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 130px 36px", gap: 8, marginBottom: 6 }}>
                {["Producto", "Cantidad", "Precio unit.", ""].map((h, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>

              {lineas.map((l, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 130px 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <select value={l.productoId}
                    onChange={e => handleLineaChange(i, "productoId", e.target.value)}
                    style={inp}>
                    <option value="">— Seleccionar —</option>
                    {(productos ?? []).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>

                  <input type="number" min="1" value={l.cantidad}
                    onChange={e => handleLineaChange(i, "cantidad", e.target.value)}
                    style={inp} placeholder="1" />

                  {/* Precio: autocompletado pero editable */}
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
                    <input type="number" min="0" step="1" value={l.precioUnitario}
                      onChange={e => handleLineaChange(i, "precioUnitario", e.target.value)}
                      style={{ ...inp, paddingLeft: 22 }} placeholder="0" />
                  </div>

                  <button type="button" onClick={() => quitarLinea(i)}
                    disabled={lineas.length === 1}
                    style={{
                      background: "none", border: "1px solid var(--border)",
                      borderRadius: "var(--radius)", width: 36, height: 36,
                      cursor: lineas.length === 1 ? "not-allowed" : "pointer",
                      color: lineas.length === 1 ? "var(--muted)" : "var(--danger)",
                      fontSize: 16, fontWeight: 600,
                    }}>×</button>
                </div>
              ))}

              <button type="button" onClick={agregarLinea} style={{ ...btnSecondary, marginTop: 4 }}>
                + Agregar producto
              </button>
            </div>

            {/* Total */}
            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "12px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)" }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--mono)" }}>
                {fmtPrecio(total)}
              </span>
            </div>

            {errorForm && (
              <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>⚠ {errorForm}</p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={guardando}
                style={{ ...btnPrimary, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Registrando…" : "Confirmar venta"}
              </button>
              <button type="button" onClick={cerrarForm} style={btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla historial ── */}
      <div className="card">
        <div className="card-title">Historial de ventas</div>

        {loading && <p className="state-msg">Cargando ventas…</p>}
        {error   && <p className="state-msg state-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Bodega</th>
                  <th>Productos vendidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(ventas ?? []).length === 0
                  ? <tr><td colSpan={5} className="state-msg">Sin ventas registradas</td></tr>
                  : (ventas ?? []).map(v => (
                      <tr key={v.id}>
                        <td className="td-mono">#{v.id}</td>
                        <td className="td-mono" style={{ fontSize: 12 }}>{fmtFecha(v.fechaVenta)}</td>
                        <td>{v.bodega?.sucursal || "—"}</td>
                        <td style={{ fontSize: 12, color: "var(--muted)" }}>
                          {(v.detalles ?? []).map(d =>
                            `${d.producto?.nombre ?? "?"} ×${d.cantidad}`
                          ).join(", ") || "—"}
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--mono)", fontSize: 13, color: "var(--navy)" }}>
                          {fmtPrecio(v.total)}
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

function Req() { return <span style={{ color: "var(--danger)" }}>*</span>; }

const lbl          = { fontSize: 13, fontWeight: 500, color: "var(--text)" };
const inp          = { padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, fontFamily: "var(--font)", background: "var(--bg)", color: "var(--text)", outline: "none", width: "100%" };
const btnPrimary   = { padding: "9px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font)", cursor: "pointer" };
const btnSecondary = { padding: "9px 16px", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, fontFamily: "var(--font)", cursor: "pointer" };
const closeBtn     = { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--muted)", lineHeight: 1 };
const exitoStyle   = { background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid #86efac", borderRadius: "var(--radius)", padding: "10px 16px", fontSize: 13, fontWeight: 500, marginBottom: 16 };