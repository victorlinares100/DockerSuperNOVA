import { useState } from "react";
import useFetch, { API } from "../hooks/useFetch";
import DataTable from "../atoms/DataTable";
import EmptyRow from "../atoms/EmptyRow";
import StateMsg from "../atoms/StateMsg";
import PageHeader from "../molecules/PageHeader";
import Badge from "../atoms/Badge";
import "../css/Pedidos.css"; 

const ESTADOS = ["PENDIENTE", "EN CAMINO", "RECIBIDO", "CANCELADO"];
const LINEA_VACIA = { productoId: "", cantidad: 1, precioUnitario: "" };

export default function Pedidos() {
  const { data: pedidos,     loading, error, refetch } = useFetch("/pedidos");
  const { data: proveedores }                          = useFetch("/proveedores");
  const { data: productos }                            = useFetch("/productos");

  const [mostrarForm,   setMostrarForm]   = useState(false);
  const [proveedorId,   setProveedorId]   = useState("");
  const [fechaEmision,  setFechaEmision]  = useState(hoy());
  const [estado,        setEstado]        = useState("PENDIENTE");
  const [lineas,        setLineas]        = useState([{ ...LINEA_VACIA }]);
  const [guardando,     setGuardando]     = useState(false);
  const [errorForm,     setErrorForm]     = useState("");
  const [exito,         setExito]         = useState("");

  const [cambiandoEstado, setCambiandoEstado] = useState(null); 

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
      <div className="page-header-row">
        <PageHeader title="Pedidos a proveedores" sub="Órdenes de compra registradas" />
        <button onClick={abrirForm} className="btn-primary">+ Nuevo pedido</button>
      </div>

      {exito && <div className="msg-exito">✓ {exito}</div>}

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div className="card card-form">
          <div className="card-title">
            Nuevo pedido
            <button type="button" onClick={cerrarForm} className="btn-close">×</button>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Fila superior */}
            <div className="form-grid-3">

              <div className="form-field">
                <label className="form-label">Proveedor <Req /></label>
                <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} className="form-input">
                  <option value="">— Seleccionar —</option>
                  {(proveedores ?? []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.descripcion || p.rutEmpresa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Fecha de emisión <Req /></label>
                <input type="date" value={fechaEmision}
                  onChange={e => setFechaEmision(e.target.value)} className="form-input" />
              </div>

              <div className="form-field">
                <label className="form-label">Estado inicial</label>
                <select value={estado} onChange={e => setEstado(e.target.value)} className="form-input">
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

            </div>

            {/* Líneas de productos */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: "block", marginBottom: 10 }}>
                Productos <Req />
              </label>

              {/* Cabecera */}
              <div className="lineas-header">
                {["Producto", "Cantidad", "Precio unit.", ""].map((h, i) => (
                  <span key={i} className="lineas-header-item">{h}</span>
                ))}
              </div>

              {lineas.map((l, i) => (
                <div key={i} className="linea-row">
                  <select value={l.productoId}
                    onChange={e => handleLineaChange(i, "productoId", e.target.value)}
                    className="form-input">
                    <option value="">— Seleccionar —</option>
                    {(productos ?? []).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>

                  <input type="number" min="1" value={l.cantidad}
                    onChange={e => handleLineaChange(i, "cantidad", e.target.value)}
                    className="form-input" placeholder="1" />

                  <div className="input-precio-wrap">
                    <span className="input-precio-prefix">$</span>
                    <input type="number" min="0" step="1" value={l.precioUnitario}
                      onChange={e => handleLineaChange(i, "precioUnitario", e.target.value)}
                      className="form-input form-input-precio" placeholder="0" />
                  </div>

                  <button type="button" onClick={() => quitarLinea(i)}
                    disabled={lineas.length === 1}
                    className="btn-quitar">×</button>
                </div>
              ))}

              <button type="button" onClick={agregarLinea} className="btn-secondary" style={{ marginTop: 4 }}>
                + Agregar producto
              </button>
            </div>

            {/* Total */}
            <div className="total-box">
              <span className="total-label">Total del pedido</span>
              <span className="total-valor">{fmtPrecio(total)}</span>
            </div>

            {errorForm && (
              <p className="msg-error-form">⚠ {errorForm}</p>
            )}

            <div className="btn-row">
              <button type="submit" disabled={guardando}
                className="btn-primary" style={{ opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Creando pedido…" : "Crear pedido"}
              </button>
              <button type="button" onClick={cerrarForm} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla de pedidos ── */}
      <div className="card">
        <div className="card-title">Historial de pedidos</div>

        <StateMsg loading={loading} error={error} />

        {!loading && !error && (
          <DataTable headers={["#", "Proveedor", "Fecha emisión", "Productos", "Total", "Estado", "Acciones"]}>
            {(pedidos ?? []).length === 0
              ? <EmptyRow cols={7} mensaje="Sin pedidos registrados" />
              : (pedidos ?? []).map(p => (
                  <tr key={p.id}>
                    <td className="td-mono">#{p.id}</td>
                    <td style={{ fontWeight: 500 }}>
                      {p.proveedor?.descripcion || p.proveedor?.rutEmpresa || "—"}
                    </td>
                    <td className="td-mono">{fmtFecha(p.fechaEmision)}</td>
                    <td className="td-productos">
                      {(p.detalles ?? []).length > 0
                        ? (p.detalles ?? []).map(d =>
                            `${d.producto?.nombre ?? "?"} ×${d.cantidadSolicitada}`
                          ).join(", ")
                        : "—"
                      }
                    </td>
                    <td className="td-total">
                      {fmtPrecio(p.total)}
                    </td>
                    <td>
                      {cambiandoEstado === p.id ? (
                        <select
                          defaultValue={p.estado}
                          autoFocus
                          onChange={e => handleCambiarEstado(p, e.target.value)}
                          onBlur={() => setCambiandoEstado(null)}
                          className="select-estado-inline"
                        >
                          {ESTADOS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge tipo={p.estado} />
                      )}
                    </td>
                    <td className="td-acciones">
                      <div className="btn-row" style={{ justifyContent: "center" }}>
                        <button
                          onClick={() => setCambiandoEstado(cambiandoEstado === p.id ? null : p.id)}
                          className="btn-editar"
                          title="Cambiar estado"
                        >
                          {cambiandoEstado === p.id ? "Cancelar" : "Estado"}
                        </button>
                      </div>
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