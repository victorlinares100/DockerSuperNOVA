import { useState, useEffect } from "react";
import useFetch, { API } from "../hooks/useFetch";

const FORM_VACIO = {
  nombre:         "",
  descripcion:    "",
  codigoDeBarras: "",
  precioVenta:    "",
  categoria:      { id: "" },
};

export default function Productos() {
  const { data, loading, error, refetch } = useFetch("/productos");
  const { data: categorias }              = useFetch("/categorias");

  const [busqueda,      setBusqueda]      = useState("");
  const [mostrarForm,   setMostrarForm]   = useState(false);
  const [modoEditar,    setModoEditar]    = useState(false);   // false = crear, true = editar
  const [form,          setForm]          = useState(FORM_VACIO);
  const [guardando,     setGuardando]     = useState(false);
  const [errorForm,     setErrorForm]     = useState("");
  const [exito,         setExito]         = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);    // id del producto a eliminar
  const [eliminando,    setEliminando]    = useState(false);

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") { cerrarForm(); setConfirmDelete(null); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const lista = (data ?? []).filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ─── Abrir formulario en modo CREAR ──────────────────────────
  function abrirCrear() {
    setForm(FORM_VACIO);
    setModoEditar(false);
    setMostrarForm(true);
    setErrorForm("");
    setExito("");
  }

  // ─── Abrir formulario en modo EDITAR ─────────────────────────
  function abrirEditar(p) {
    setForm({
      id:             p.id,
      nombre:         p.nombre         ?? "",
      descripcion:    p.descripcion    ?? "",
      codigoDeBarras: p.codigoDeBarras ?? "",
      precioVenta:    p.precioVenta    != null ? String(p.precioVenta) : "",
      categoria:      { id: p.categoria?.id ? String(p.categoria.id) : "" },
    });
    setModoEditar(true);
    setMostrarForm(true);
    setErrorForm("");
    setExito("");
  }

  function cerrarForm() {
    setMostrarForm(false);
    setForm(FORM_VACIO);
    setErrorForm("");
    setModoEditar(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "categoriaId") {
      setForm(f => ({ ...f, categoria: { id: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  // ─── Guardar (crear o editar) ─────────────────────────────────
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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      cerrarForm();
      setExito(modoEditar ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      setTimeout(() => setExito(""), 3000);
      refetch();
    } catch (err) {
      setErrorForm(err.message || "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  // ─── Eliminar ─────────────────────────────────────────────────
  async function handleEliminar() {
    if (!confirmDelete) return;
    setEliminando(true);
    try {
      const res = await fetch(`${API}/productos/${confirmDelete}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`Error ${res.status}`);
      setConfirmDelete(null);
      setExito("Producto eliminado correctamente.");
      setTimeout(() => setExito(""), 3000);
      refetch();
    } catch (err) {
      setConfirmDelete(null);
      setExito("");
    } finally {
      setEliminando(false);
    }
  }

  const fmtPrecio = n => n != null ? `$${Number(n).toLocaleString("es-CL")}` : "—";

  // Nombre del producto que se va a eliminar
  const nombreAEliminar = (data ?? []).find(p => p.id === confirmDelete)?.nombre ?? "";

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-sub">Catálogo completo de productos</p>
        </div>
        <button onClick={abrirCrear} style={btnPrimary}>+ Nuevo producto</button>
      </div>

      {/* Éxito */}
      {exito && <div style={exitoStyle}>✓ {exito}</div>}

      {/* ── Modal confirmar eliminar ── */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }}>
          <div style={{
            background: "var(--surface)", borderRadius: "var(--radius-lg)",
            padding: "28px 32px", maxWidth: 400, width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          }}>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, color: "var(--navy)" }}>
              ¿Eliminar producto?
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
              Vas a eliminar <strong style={{ color: "var(--text)" }}>"{nombreAEliminar}"</strong>.
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                style={{ ...btnPrimary, background: "var(--danger)", opacity: eliminando ? 0.6 : 1 }}
              >
                {eliminando ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button onClick={() => setConfirmDelete(null)} style={btnSecondary}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Formulario crear / editar ── */}
      {mostrarForm && (
        <div className="card" style={{ borderColor: "var(--accent)", borderWidth: 1.5, marginBottom: 24 }}>
          <div className="card-title">
            {modoEditar ? `Editando: ${form.nombre}` : "Nuevo producto"}
            <button onClick={cerrarForm} style={closeBtn} title="Cerrar (Esc)">×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

              <div style={field}>
                <label style={lbl}>Nombre <Req /></label>
                <input style={inp} name="nombre" value={form.nombre}
                  onChange={handleChange} placeholder="Ej: Leche Entera 1L" autoFocus />
              </div>

              <div style={field}>
                <label style={lbl}>Código de barras</label>
                <input style={inp} name="codigoDeBarras" value={form.codigoDeBarras}
                  onChange={handleChange} placeholder="Ej: 7802000123456" />
              </div>

              <div style={field}>
                <label style={lbl}>Categoría <Req /></label>
                <select style={inp} name="categoriaId"
                  value={form.categoria.id} onChange={handleChange}>
                  <option value="">— Seleccionar —</option>
                  {(categorias ?? []).map(c => (
                    <option key={c.id} value={c.id}>{c.Nombre_Categoria}</option>
                  ))}
                </select>
              </div>

              <div style={field}>
                <label style={lbl}>Precio de venta</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13 }}>$</span>
                  <input style={{ ...inp, paddingLeft: 22 }} name="precioVenta"
                    type="number" min="0" step="1" value={form.precioVenta}
                    onChange={handleChange} placeholder="0" />
                </div>
              </div>

              <div style={{ ...field, gridColumn: "1 / -1" }}>
                <label style={lbl}>Descripción</label>
                <input style={inp} name="descripcion" value={form.descripcion}
                  onChange={handleChange} placeholder="Opcional" />
              </div>

            </div>

            {errorForm && (
              <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>⚠ {errorForm}</p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={guardando}
                style={{ ...btnPrimary, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando…" : modoEditar ? "Guardar cambios" : "Crear producto"}
              </button>
              <button type="button" onClick={cerrarForm} style={btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="card">
        <div className="toolbar">
          <input className="search" placeholder="Buscar por nombre…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {!loading && `${lista.length} producto${lista.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {loading && <p className="state-msg">Cargando productos…</p>}
        {error   && <p className="state-msg state-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio venta</th>
                  <th>Descripción</th>
                  <th style={{ width: 100, textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0
                  ? <tr><td colSpan={5} className="state-msg">Sin resultados</td></tr>
                  : lista.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                        <td>{p.categoria?.Nombre_Categoria || "—"}</td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
                          {fmtPrecio(p.precioVenta)}
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 13 }}>{p.descripcion || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            {/* Editar */}
                            <button
                              onClick={() => abrirEditar(p)}
                              title="Editar"
                              style={{
                                padding: "5px 10px", fontSize: 12, fontWeight: 500,
                                background: "var(--accent-light)", color: "var(--accent)",
                                border: "1px solid #bfdbfe", borderRadius: "var(--radius)",
                                cursor: "pointer", fontFamily: "var(--font)",
                              }}
                            >
                              Editar
                            </button>
                            {/* Eliminar */}
                            <button
                              onClick={() => setConfirmDelete(p.id)}
                              title="Eliminar"
                              style={{
                                padding: "5px 10px", fontSize: 12, fontWeight: 500,
                                background: "var(--danger-bg)", color: "var(--danger)",
                                border: "1px solid #fca5a5", borderRadius: "var(--radius)",
                                cursor: "pointer", fontFamily: "var(--font)",
                              }}
                            >
                              Eliminar
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
const inp          = { padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, fontFamily: "var(--font)", background: "var(--bg)", color: "var(--text)", outline: "none", width: "100%" };
const btnPrimary   = { padding: "9px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font)", cursor: "pointer" };
const btnSecondary = { padding: "9px 16px", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, fontFamily: "var(--font)", cursor: "pointer" };
const closeBtn     = { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--muted)", lineHeight: 1 };
const exitoStyle   = { background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid #86efac", borderRadius: "var(--radius)", padding: "10px 16px", fontSize: 13, fontWeight: 500, marginBottom: 16 };