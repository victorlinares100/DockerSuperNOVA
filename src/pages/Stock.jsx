import { useState, useEffect } from "react";
import useFetch, { API } from "../hooks/useFetch";

const FORM_VACIO = {
  producto:           { id: "" },
  bodega:             { id: "" },
  cantidadDisponible: "",
  stockMinimo:        "",
  fechaIngreso:       "",
  fechaVencimiento:   "",
};

export default function Stock() {
  const { data,         loading,  error,   refetch } = useFetch("/stocks");
  const { data: productos }                          = useFetch("/productos");
  const { data: bodegas }                            = useFetch("/bodegas");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form,        setForm]        = useState(FORM_VACIO);
  const [guardando,   setGuardando]   = useState(false);
  const [errorForm,   setErrorForm]   = useState("");
  const [exito,       setExito]       = useState(false);
  const [busqueda,    setBusqueda]    = useState("");

  // Cerrar con Escape
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") cerrarForm(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const lista = (data ?? []).filter(s =>
    s.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.bodega?.sucursal?.toLowerCase().includes(busqueda.toLowerCase())
  );

  function abrirForm()  { setMostrarForm(true); setErrorForm(""); setExito(false); }
  function cerrarForm() { setMostrarForm(false); setForm(FORM_VACIO); setErrorForm(""); }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "productoId") {
      setForm(f => ({ ...f, producto: { id: value } }));
    } else if (name === "bodegaId") {
      setForm(f => ({ ...f, bodega: { id: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorForm("");

    if (!form.producto.id)         { setErrorForm("Selecciona un producto.");          return; }
    if (!form.bodega.id)           { setErrorForm("Selecciona una bodega.");            return; }
    if (!form.cantidadDisponible || Number(form.cantidadDisponible) < 0) {
                                     setErrorForm("Ingresa una cantidad válida.");      return; }
    if (!form.fechaIngreso)        { setErrorForm("La fecha de ingreso es obligatoria."); return; }

    setGuardando(true);
    try {
      const body = {
        ...form,
        cantidadDisponible: Number(form.cantidadDisponible),
        stockMinimo:        Number(form.stockMinimo) || 0,
      };
      const res = await fetch(`${API}/stocks`, {
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
      setTimeout(() => setExito(false), 3000);
      refetch();
    } catch (err) {
      setErrorForm(err.message || "No se pudo registrar el stock.");
    } finally {
      setGuardando(false);
    }
  }

  // Helpers visuales
  const estadoStock = (cantidad, minimo) => {
    const min = minimo ?? 10;
    if (cantidad <= 0)     return { cls: "badge badge-danger", txt: "Sin stock" };
    if (cantidad < min)    return { cls: "badge badge-warn",   txt: "Stock bajo" };
    return                        { cls: "badge badge-ok",     txt: "Normal" };
  };

  const fmtFecha = f => f ? new Date(f).toLocaleDateString("es-CL") : "—";

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <h1 className="page-title">Stock</h1>
          <p className="page-sub">Inventario por producto y bodega</p>
        </div>
        <button onClick={abrirForm} style={btnPrimaryStyle}>
          + Registrar stock
        </button>
      </div>

      {/* Éxito */}
      {exito && (
        <div style={exitoStyle}>✓ Stock registrado correctamente.</div>
      )}

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div className="card" style={{ borderColor: "var(--accent)", borderWidth: 1.5, marginBottom: 24 }}>
          <div className="card-title">
            Registrar stock
            <button onClick={cerrarForm} style={closeBtnStyle} title="Cerrar (Esc)">×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

              {/* Producto */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Producto <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <select name="productoId" value={form.producto.id} onChange={handleChange} style={inputStyle}>
                  <option value="">— Seleccionar —</option>
                  {(productos ?? []).map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Bodega */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Bodega <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <select name="bodegaId" value={form.bodega.id} onChange={handleChange} style={inputStyle}>
                  <option value="">— Seleccionar —</option>
                  {(bodegas ?? []).map(b => (
                    <option key={b.id} value={b.id}>{b.sucursal}</option>
                  ))}
                </select>
              </div>

              {/* Cantidad */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Cantidad <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="number"
                  name="cantidadDisponible"
                  value={form.cantidadDisponible}
                  onChange={handleChange}
                  min="0"
                  placeholder="Ej: 50"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {/* Stock mínimo */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Stock mínimo</label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={form.stockMinimo}
                  onChange={handleChange}
                  min="0"
                  placeholder="Ej: 10"
                  style={inputStyle}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  Alerta cuando baje de este número
                </span>
              </div>

              {/* Fecha ingreso */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Fecha de ingreso <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={form.fechaIngreso}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Fecha vencimiento */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Fecha de vencimiento</label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={form.fechaVencimiento}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Opcional — dejar vacío si no aplica</span>
              </div>

            </div>

            {errorForm && (
              <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>⚠ {errorForm}</p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={guardando} style={{ ...btnPrimaryStyle, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando…" : "Registrar stock"}
              </button>
              <button type="button" onClick={cerrarForm} style={btnSecondaryStyle}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Banner alertas stock bajo ── */}
      {(() => {
        const alertas = (data ?? []).filter(s => {
          const cant = s.cantidadDisponible ?? 0;
          const min  = s.stockMinimo ?? 10;
          return cant < min;
        });
        if (alertas.length === 0) return null;
        return (
          <div style={{
            background: "#fef9c3", border: "1px solid #fde047",
            borderRadius: "var(--radius-lg)", padding: "14px 20px",
            marginBottom: 20,
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#854d0e", marginBottom: 8 }}>
              ⚠ {alertas.length} producto{alertas.length !== 1 ? "s" : ""} con stock bajo
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {alertas.map(s => (
                <span key={s.id} style={{
                  background: "#fff", border: "1px solid #fde047",
                  borderRadius: "var(--radius)", padding: "4px 10px",
                  fontSize: 12, color: "#854d0e",
                }}>
                  {s.producto?.nombre || "—"}
                  <span style={{ fontWeight: 600, marginLeft: 6 }}>
                    {s.cantidadDisponible ?? 0} / {s.stockMinimo ?? 10} mín
                  </span>
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Tabla ── */}
      <div className="card">
        <div className="toolbar">
          <input
            className="search"
            placeholder="Buscar por producto o bodega…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {!loading && `${lista.length} registro${lista.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {loading && <p className="state-msg">Cargando stock…</p>}
        {error   && <p className="state-msg state-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Bodega</th>
                  <th>Cantidad</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                  <th>Ingreso</th>
                  <th>Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0
                  ? <tr><td colSpan={6} className="state-msg">Sin registros de stock</td></tr>
                  : lista.map(s => {
                      const { cls, txt } = estadoStock(s.cantidadDisponible ?? s.cantidad_disponible, s.stockMinimo);
                      const vence = s.fechaVencimiento ?? s.fecha_vencimiento;
                      const hoy   = new Date();
                      const diasVence = vence
                        ? Math.ceil((new Date(vence) - hoy) / (1000*60*60*24))
                        : null;

                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 500 }}>
                            {s.producto?.nombre || "—"}
                          </td>
                          <td>{s.bodega?.sucursal || "—"}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 60, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{
                                  height: "100%", borderRadius: 3,
                                  width: Math.min(100, ((s.cantidadDisponible ?? 0) / 100) * 100) + "%",
                                  background: (s.cantidadDisponible ?? 0) < 10 ? "#ef4444"
                                            : (s.cantidadDisponible ?? 0) < 30 ? "#f59e0b"
                                            : "#16a34a",
                                }}/>
                              </div>
                              <span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
                                {s.cantidadDisponible ?? s.cantidad_disponible ?? 0}
                              </span>
                            </div>
                          </td>
                          <td><span className={cls}>{txt}</span></td>
                          <td className="td-mono">{s.stockMinimo ?? 10}</td>
                          <td className="td-mono">{fmtFecha(s.fechaIngreso ?? s.fecha_ingreso)}</td>
                          <td>
                            {!vence ? (
                              <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>
                            ) : diasVence < 0 ? (
                              <span className="badge badge-danger">Vencido</span>
                            ) : diasVence <= 7 ? (
                              <span className="badge badge-warn">Vence en {diasVence}d</span>
                            ) : (
                              <span className="td-mono">{fmtFecha(vence)}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────
const fieldStyle      = { display: "flex", flexDirection: "column", gap: 5 };
const labelStyle      = { fontSize: 13, fontWeight: 500, color: "var(--text)" };
const inputStyle      = { padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, fontFamily: "var(--font)", background: "var(--bg)", color: "var(--text)", outline: "none", width: "100%" };
const btnPrimaryStyle = { padding: "9px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font)", cursor: "pointer" };
const btnSecondaryStyle = { padding: "9px 18px", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, fontFamily: "var(--font)", cursor: "pointer" };
const closeBtnStyle   = { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--muted)", lineHeight: 1 };
const exitoStyle      = { background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid #86efac", borderRadius: "var(--radius)", padding: "10px 16px", fontSize: 13, fontWeight: 500, marginBottom: 16 };