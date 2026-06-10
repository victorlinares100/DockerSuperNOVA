import { useState, useEffect } from "react";
import useFetch, { API } from "../hooks/useFetch";
import DataTable from "../atoms/DataTable";
import EmptyRow from "../atoms/EmptyRow";
import StateMsg from "../atoms/StateMsg";
import PageHeader from "../molecules/PageHeader";
import "../css/Productos.css"; 

const FORM_VACIO = {
  nombre:         "",
  descripcion:    "",
  codigoDeBarras: "",
  precioVenta:    "",
  categoria:      { id: "" },
};

export default function Productos() {
  const { data,          loading,  error,   refetch } = useFetch("/productos");
  const { data: stocks }                              = useFetch("/stocks");
  const { data: categorias }                          = useFetch("/categorias");

  const [busqueda,      setBusqueda]      = useState("");
  const [mostrarForm,   setMostrarForm]   = useState(false);
  const [modoEditar,    setModoEditar]    = useState(false);
  const [form,          setForm]          = useState(FORM_VACIO);
  const [guardando,     setGuardando]     = useState(false);
  const [errorForm,     setErrorForm]     = useState("");
  const [exito,         setExito]         = useState("");

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") { cerrarForm(); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  function stockDeProducto(productoId) {
    if (!stocks) return null;
    const registros = stocks.filter(s => s.producto?.id === productoId);
    if (registros.length === 0) return null;
    const total  = registros.reduce((acc, s) => acc + (s.cantidadDisponible ?? 0), 0);
    const minimo = registros.reduce((acc, s) => acc + (s.stockMinimo ?? 0), 0);
    return { total, minimo, registros: registros.length };
  }

  const lista = (data ?? []).filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  function abrirCrear() {
    setForm(FORM_VACIO); setModoEditar(false);
    setMostrarForm(true); setErrorForm(""); setExito("");
  }

  // ← función restaurada
  function abrirEditar(p) {
    setForm({
      id:             p.id,
      nombre:         p.nombre         ?? "",
      descripcion:    p.descripcion    ?? "",
      codigoDeBarras: p.codigoDeBarras ?? "",
      precioVenta:    p.precioVenta    != null ? String(p.precioVenta) : "",
      categoria:      { id: p.categoria?.id ? String(p.categoria.id) : "" },
    });
    setModoEditar(true); setMostrarForm(true); setErrorForm(""); setExito("");
  }

  function cerrarForm() {
    setMostrarForm(false); setForm(FORM_VACIO);
    setErrorForm(""); setModoEditar(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "categoriaId") setForm(f => ({ ...f, categoria: { id: value } }));
    else                        setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorForm("");
    if (!form.nombre.trim()) { setErrorForm("El nombre es obligatorio.");  return; }
    if (!form.categoria.id)  { setErrorForm("Selecciona una categoría."); return; }

    const body = {
      nombre:         form.nombre.trim(),
      descripcion:    form.descripcion.trim(),
      codigoDeBarras: form.codigoDeBarras.trim(),
      precioVenta:    form.precioVenta !== "" ? Number(form.precioVenta) : null,
      categoria:      { id: Number(form.categoria.id) },
    };
    const url    = modoEditar ? `${API}/productos/${form.id}` : `${API}/productos`;
    const method = modoEditar ? "PUT" : "POST";

    setGuardando(true);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
      cerrarForm();
      setExito(modoEditar ? "Producto actualizado." : "Producto creado.");
      setTimeout(() => setExito(""), 3000);
      refetch();
    } catch (err) {
      setErrorForm(err.message || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  const fmtPrecio = n => n != null ? `$${Number(n).toLocaleString("es-CL")}` : "—";

  return (
    <div className="page-wrapper">

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <PageHeader title="Productos" sub="Catálogo completo — stock en tiempo real" />
        <button onClick={abrirCrear} className="btn-primary">+ Nuevo producto</button>
      </div>

      {exito && <div className="msg-exito">✓ {exito}</div>}

      {mostrarForm && (
        <div className="card card-form">
          <div className="card-title">
            {modoEditar ? `Editando: ${form.nombre}` : "Nuevo producto"}
            <button onClick={cerrarForm} className="btn-close" title="Esc">×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Nombre <Req /></label>
                <input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Leche Entera 1L" autoFocus />
              </div>
              <div className="form-field">
                <label className="form-label">Código de barras</label>
                <input className="form-input" name="codigoDeBarras" value={form.codigoDeBarras} onChange={handleChange} placeholder="Ej: 7802000123456" />
              </div>
              <div className="form-field">
                <label className="form-label">Categoría <Req /></label>
                <select className="form-input" name="categoriaId" value={form.categoria.id} onChange={handleChange}>
                  <option value="">— Seleccionar —</option>
                  {(categorias ?? []).map(c => (
                    <option key={c.id} value={c.id}>{c.nombre_Categoria}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Precio de venta</label>
                <div className="input-precio-wrap">
                  <span className="input-precio-prefix">$</span>
                  <input className="form-input form-input-precio" name="precioVenta" type="number" min="0" step="1" value={form.precioVenta} onChange={handleChange} placeholder="0" />
                </div>
              </div>
              <div className="form-field form-field-full">
                <label className="form-label">Descripción</label>
                <input className="form-input" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Opcional" />
              </div>
            </div>
            {errorForm && <p className="msg-error-form">⚠ {errorForm}</p>}
            <div className="btn-row">
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? "Guardando…" : modoEditar ? "Guardar cambios" : "Crear producto"}
              </button>
              <button type="button" onClick={cerrarForm} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <input className="search" placeholder="Buscar por nombre…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {!loading && `${lista.length} producto${lista.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <StateMsg loading={loading} error={error} />

        {!loading && !error && (
          <DataTable headers={["Nombre", "Categoría", "Precio venta", "Stock total", "Estado", "Acciones"]}>
            {lista.length === 0
              ? <EmptyRow cols={6} mensaje="Sin resultados" />
              : lista.map(p => {
                  const stock = stockDeProducto(p.id);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                      <td>{p.categoria?.nombre_Categoria || "—"}</td>
                      <td className="td-precio">{fmtPrecio(p.precioVenta)}</td>

                      <td>
                        {stock === null ? (
                          <span className="stock-muted">Sin stock</span>
                        ) : (
                          <div className="stock-container">
                            <div className="stock-bar-bg">
                              <div className="stock-bar-fill" style={{
                                width: Math.min(100, (stock.total / Math.max(stock.minimo * 2, 50)) * 100) + "%",
                                background: stock.total <= 0             ? "#ef4444"
                                          : stock.total < stock.minimo   ? "#f59e0b"
                                          : "#16a34a",
                              }} />
                            </div>
                            <span className="stock-text">{stock.total}</span>
                          </div>
                        )}
                      </td>

                      <td>
                        {stock === null ? (
                          <span className="badge badge-danger">Sin stock</span>
                        ) : stock.total <= 0 ? (
                          <span className="badge badge-danger">Agotado</span>
                        ) : stock.total < stock.minimo ? (
                          <span className="badge badge-warn">Stock bajo</span>
                        ) : (
                          <span className="badge badge-ok">Normal</span>
                        )}
                      </td>

                      {/* ← botón Editar restaurado, sin Eliminar */}
                      <td style={{ width: 80 }}>
                        <button onClick={() => abrirEditar(p)} className="btn-editar">Editar</button>
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