import { useState, useEffect } from "react";
import useFetch, { API } from "../hooks/useFetch";
import DataTable from "../atoms/DataTable";
import EmptyRow from "../atoms/EmptyRow";
import StateMsg from "../atoms/StateMsg";
import PageHeader from "../molecules/PageHeader";
import * as XLSX from "xlsx";
import "../css/Stock.css";

function exportarExcel(datos, nombreArchivo) {
  if (!datos || datos.length === 0) {
    alert("No hay datos para exportar");
    return;
  }
  const hoja    = XLSX.utils.json_to_sheet(datos);
  const libro   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Datos");
  XLSX.writeFile(libro, nombreArchivo + ".xlsx");
}

const FORM_VACIO = {
  producto:           { id: "" },
  bodega:             { id: "" },
  cantidadDisponible: "",
  stockMinimo:        "",
  fechaIngreso:       "",
  fechaVencimiento:   "",
};

export default function Stock() {
  const { data,          loading,  error,   refetch } = useFetch("/stocks");
  const { data: productos }                           = useFetch("/productos");
  const { data: bodegas }                             = useFetch("/bodegas");

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

  // Buscador mágico de nombres de bodega
  const getBodegaName = (id) => {
    const b = (bodegas ?? []).find(x => String(x.id) === String(id));
    return b ? b.sucursal : `Bodega ID: ${id}`;
  };

  const lista = (data ?? []).filter(s => {
    const nombreBodega = getBodegaName(s.bodegaId);
    return s.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
           nombreBodega.toLowerCase().includes(busqueda.toLowerCase());
  });

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
    if (!form.bodega.id)           { setErrorForm("Selecciona una bodega.");           return; }
    if (!form.cantidadDisponible || Number(form.cantidadDisponible) < 0) {
                                     setErrorForm("Ingresa una cantidad válida.");      return; }
    if (!form.fechaIngreso)        { setErrorForm("La fecha de ingreso es obligatoria."); return; }

    setGuardando(true);
    try {
      const body = {
        ...form,
        bodegaId:           Number(form.bodega.id), // <-- Enviamos el ID limpio para Java
        producto:           { id: Number(form.producto.id) },
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
        <PageHeader title="Stock" sub="Inventario por producto y bodega" />
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => exportarExcel(lista, "inventario_stock")} 
            className="btn-secondary"
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Exportar Excel
          </button>
          
          <button onClick={abrirForm} className="btn-primary">
            + Registrar stock
          </button>
        </div>
      </div>

      {exito && <div className="msg-exito">✓ Stock registrado correctamente.</div>}

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div className="card card-form">
          <div className="card-title">
            Registrar stock
            <button onClick={cerrarForm} className="btn-close" title="Cerrar (Esc)">×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Producto <Req /></label>
                <select name="productoId" value={form.producto.id} onChange={handleChange} className="form-input">
                  <option value="">— Seleccionar —</option>
                  {(productos ?? []).map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Bodega <Req /></label>
                <select name="bodegaId" value={form.bodega.id} onChange={handleChange} className="form-input">
                  <option value="">— Seleccionar —</option>
                  {(bodegas ?? []).map(b => (
                    <option key={b.id} value={b.id}>{b.sucursal}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Cantidad <Req /></label>
                <input
                  type="number"
                  name="cantidadDisponible"
                  value={form.cantidadDisponible}
                  onChange={handleChange}
                  min="0"
                  placeholder="Ej: 50"
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label className="form-label">Stock mínimo</label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={form.stockMinimo}
                  onChange={handleChange}
                  min="0"
                  placeholder="Ej: 10"
                  className="form-input"
                />
                <span className="form-hint">Alerta cuando baje de este número</span>
              </div>

              <div className="form-field">
                <label className="form-label">Fecha de ingreso <Req /></label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={form.fechaIngreso}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Fecha de vencimiento</label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={form.fechaVencimiento}
                  onChange={handleChange}
                  className="form-input"
                />
                <span className="form-hint">Opcional — dejar vacío si no aplica</span>
              </div>
            </div>

            {errorForm && <p className="msg-error-form">⚠ {errorForm}</p>}

            <div className="btn-row">
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? "Guardando…" : "Registrar stock"}
              </button>
              <button type="button" onClick={cerrarForm} className="btn-secondary">Cancelar</button>
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
          <div className="alert-banner">
            <div className="alert-banner-title">
              ⚠ {alertas.length} producto{alertas.length !== 1 ? "s" : ""} con stock bajo
            </div>
            <div className="alert-tags">
              {alertas.map(s => (
                <span key={s.id} className="alert-tag">
                  {s.producto?.nombre || "—"}
                  <span className="alert-tag-bold">
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

        <StateMsg loading={loading} error={error} />

        {!loading && !error && (
          <DataTable headers={["Producto", "Bodega", "Cantidad", "Mínimo", "Estado", "Ingreso", "Vencimiento"]}>
            {lista.length === 0
              ? <EmptyRow cols={7} mensaje="Sin registros de stock" />
              : lista.map(s => {
                  const { cls, txt } = estadoStock(s.cantidadDisponible ?? s.cantidad_disponible, s.stockMinimo);
                  const vence = s.fechaVencimiento ?? s.fecha_vencimiento;
                  const hoy   = new Date();
                  const diasVence = vence
                    ? Math.ceil((new Date(vence) - hoy) / (1000*60*60*24))
                    : null;

                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.producto?.nombre || "—"}</td>
                      <td>{getBodegaName(s.bodegaId)}</td>
                      <td>
                        <div className="stock-container">
                          <div className="stock-bar-bg">
                            <div className="stock-bar-fill" style={{
                              width: Math.min(100, ((s.cantidadDisponible ?? 0) / 100) * 100) + "%",
                              background: (s.cantidadDisponible ?? 0) < 10 ? "#ef4444"
                                        : (s.cantidadDisponible ?? 0) < 30 ? "#f59e0b"
                                        : "#16a34a",
                            }}/>
                          </div>
                          <span className="stock-text">
                            {s.cantidadDisponible ?? s.cantidad_disponible ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="td-mono">{s.stockMinimo ?? 10}</td>
                      <td><span className={cls}>{txt}</span></td>
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
          </DataTable>
        )}
      </div>
    </div>
  );
}

function Req() { return <span style={{ color: "var(--danger)" }}>*</span>; }