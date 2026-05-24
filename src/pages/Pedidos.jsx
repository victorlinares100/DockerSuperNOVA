import { useState } from "react";
import useFetch, { API } from "../hooks/useFetch";

const ESTADOS = ["PENDIENTE", "EN CAMINO", "RECIBIDO", "CANCELADO"];
const LINEA_VACIA = { productoId: "", cantidad: 1, precioUnitario: "" };

const ESTADO_STYLE = {
  PENDIENTE:   "badge badge-warn",
  "EN CAMINO": "badge badge-info",
  RECIBIDO:    "badge badge-ok",
  CANCELADO:   "badge badge-danger",
};

export default function Pedidos() {
  const { data: pedidos,    loading, error, refetch } = useFetch("/pedidos");
  const { data: proveedores }                         = useFetch("/proveedores");
  const { data: productos }                           = useFetch("/productos");

  const [mostrarForm,   setMostrarForm]   = useState(false);
  const [proveedorId,   setProveedorId]   = useState("");
  const [fechaEmision,  setFechaEmision]  = useState(hoy());
  const [estado,        setEstado]        = useState("PENDIENTE");
  const [lineas,        setLineas]        = useState([{ ...LINEA_VACIA }]);
  const [guardando,     setGuardando]     = useState(false);
  const [errorForm,     setErrorForm]     = useState("");
  const [exito,         setExito]         = useState("");

  // ─── Cambiar estado de un pedido existente ────────────────────
  const [cambiandoEstado, setCambiandoEstado] = useState(null); // id del pedido

  function hoy() {
    return new Date().toISOString().split("T")[0];
  }

  function abrirForm()  { setMostrarForm(true); setErrorForm(""); setExito(""); }
  function cerrarForm() {
    setMostrarForm(false);
    setProveedorId(""); setFechaEmision(hoy());
    setEstado("PENDIENTE"); setLineas([{ ...LINEA_VACIA }]);
    setErrorForm("");
  }

  function handleLineaChange(i, campo, valor) {
    setLineas(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [campo]: valor };
      return next;
    });
  }

  function agregarLinea() { setLineas(p => [...p, { ...LINEA_VACIA }]); }
  function quitarLinea(i) { setLineas(p => p.filter((_, idx) => idx !== i)); }

  const total = lineas.reduce((acc, l) =>
    acc + (Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0), 0
  );

  // ─── Crear pedido ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorForm("");

    if (!proveedorId)      { setErrorForm("Selecciona un proveedor.");          return; }
    if (!fechaEmision)     { setErrorForm("Ingresa la fecha de emisión.");      return; }
    if (!lineas.length)    { setErrorForm("Agrega al menos un producto.");      return; }
    for (const [i, l] of lineas.entries()) {
      if (!l.productoId)   { setErrorForm(`Línea ${i+1}: selecciona un producto.`);    return; }
      if (l.cantidad < 1)  { setErrorForm(`Línea ${i+1}: la cantidad debe ser ≥ 1.`); return; }
      if (!l.precioUnitario || Number(l.precioUnitario) <= 0) {
        setErrorForm(`Línea ${i+1}: ingresa un precio válido.`); return;
      }
    }

    const body = {
      proveedor:    { id: Number(proveedorId) },
      fechaEmision: fechaEmision,
      estado:       estado,
      total:        total,
      detalles:     lineas.map(l => ({
        producto:          { id: Number(l.productoId) },
        cantidadSolicitada: Number(l.cantidad),
        precioUnitario:    Number(l.precioUnitario),
      })),
    };

    setGuardando(true);
    try {
      const res = await fetch(`${API}/pedidos`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
      cerrarForm();
      setExito("Pedido creado correctamente.");
      setTimeout(() => setExito(""), 3000);
      refetch();
    } catch (err) {
      setErrorForm(err.message || "No se pudo crear el pedido.");
    } finally {
      setGuardando(false);
    }
  }

  // ─── Cambiar estado de pedido existente ───────────────────────
  async function handleCambiarEstado(pedido, nuevoEstado) {
    try {
      const res = await fetch(`${API}/pedidos/${pedido.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...pedido, estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setCambiandoEstado(null);
      setExito(`Pedido #${pedido.id} actualizado a "${nuevoEstado}".`);
      setTimeout(() => setExito(""), 3000);
      refetch();
    } catch (err) {
      setErrorForm(err.message);
    }
  }

  const fmtFecha  = f => f ? new Date(f).toLocaleDateString("es-CL") : "—";
  const fmtPrecio = n => `$${Number(n ?? 0).toLocaleString("es-CL")}`;

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <h1 className="page-title">Pedidos a proveedores</h1>
          <p className="page-sub">Órdenes de compra registradas</p>
        </div>
        <button onClick={abrirForm} style={btnPrimary}>+ Nuevo pedido</button>
      </div>

      {exito && <div style={exitoStyle}>✓ {exito}</div>}

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div className="card" style={{ borderColor: "var(--accent)", borderWidth: 1.5, marginBottom: 24 }}>
          <div className="card-title">
            Nuevo pedido
            <button onClick={cerrarForm} style={closeBtn}>×</button>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Fila superior */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

              <div style={field}>
                <label style={lbl}>Proveedor <Req /></label>
                <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} style={inp}>
                  <option value="">— Seleccionar —</option>
                  {(proveedores ?? []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.descripcion || p.rutEmpresa}
                    </option>
                  ))}
                </select>
              </div>

              <div style={field}>
                <label style={lbl}>Fecha de emisión <Req /></label>
                <input type="date" value={fechaEmision}
                  onChange={e => setFechaEmision(e.target.value)} style={inp} />
              </div>

              <div style={field}>
                <label style={lbl}>Estado inicial</label>
                <select value={estado} onChange={e => setEstado(e.target.value)} style={inp}>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

            </div>

            {/* Líneas de productos */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lbl, display: "block", marginBottom: 10 }}>
                Productos <Req />
              </label>

              {/* Cabecera */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 130px 36px", gap: 8, marginBottom: 6 }}>
                {["Producto", "Cantidad", "Precio unit.", ""].map((h, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>

              {lineas.map((l, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 130px 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
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

              <button type="button" onClick={agregarLinea}
                style={{ ...btnSecondary, marginTop: 4 }}>
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
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)" }}>Total del pedido</span>
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
                {guardando ? "Creando pedido…" : "Crear pedido"}
              </button>
              <button type="button" onClick={cerrarForm} style={btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla de pedidos ── */}
      <div className="card">
        <div className="card-title">Historial de pedidos</div>

        {loading && <p className="state-msg">Cargando pedidos…</p>}
        {error   && <p className="state-msg state-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Proveedor</th>
                  <th>Fecha emisión</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th style={{ width: 120, textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(pedidos ?? []).length === 0
                  ? <tr><td colSpan={7} className="state-msg">Sin pedidos registrados</td></tr>
                  : (pedidos ?? []).map(p => (
                      <tr key={p.id}>
                        <td className="td-mono">#{p.id}</td>
                        <td style={{ fontWeight: 500 }}>
                          {p.proveedor?.descripcion || p.proveedor?.rutEmpresa || "—"}
                        </td>
                        <td className="td-mono">{fmtFecha(p.fechaEmision)}</td>
                        <td style={{ fontSize: 12, color: "var(--muted)" }}>
                          {(p.detalles ?? []).length > 0
                            ? (p.detalles ?? []).map(d =>
                                `${d.producto?.nombre ?? "?"} ×${d.cantidadSolicitada}`
                              ).join(", ")
                            : "—"
                          }
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600 }}>
                          {fmtPrecio(p.total)}
                        </td>
                        <td>
                          {cambiandoEstado === p.id ? (
                            <select
                              defaultValue={p.estado}
                              autoFocus
                              onChange={e => handleCambiarEstado(p, e.target.value)}
                              onBlur={() => setCambiandoEstado(null)}
                              style={{ ...inp, fontSize: 12, padding: "4px 8px" }}
                            >
                              {ESTADOS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={ESTADO_STYLE[p.estado?.toUpperCase()] ?? "badge badge-info"}>
                              {p.estado ?? "—"}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              onClick={() => setCambiandoEstado(cambiandoEstado === p.id ? null : p.id)}
                              style={btnEditar}
                              title="Cambiar estado"
                            >
                              {cambiandoEstado === p.id ? "Cancelar" : "Estado"}
                            </button>
                          </div>
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

const field        = { display: "flex", flexDirection: "column", gap: 5 };
const lbl          = { fontSize: 13, fontWeight: 500, color: "var(--text)" };
const inp          = { padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, fontFamily: "var(--font)", background: "var(--bg)", color: "var(--text)", outline: "none", width: "100%" };
const btnPrimary   = { padding: "9px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font)", cursor: "pointer" };
const btnSecondary = { padding: "9px 16px", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, fontFamily: "var(--font)", cursor: "pointer" };
const closeBtn     = { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--muted)", lineHeight: 1 };
const exitoStyle   = { background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid #86efac", borderRadius: "var(--radius)", padding: "10px 16px", fontSize: 13, fontWeight: 500, marginBottom: 16 };
const btnEditar    = { padding: "5px 10px", fontSize: 12, fontWeight: 500, background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid #bfdbfe", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "var(--font)" };