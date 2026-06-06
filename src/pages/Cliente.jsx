import { useState } from "react";
import useFetch, { API } from "../hooks/useFetch";
import "../css/Cliente.css";

// ─── Helpers ──────────────────────────────────────────────────
const fmtPrecio = n => n != null ? `$${Number(n).toLocaleString("es-CL")}` : "—";

const iconoPorCategoria = cat => {
  const mapa = {
    "Lácteos":           "🥛",
    "Bebidas":           "🥤",
    "Panadería":         "🍞",
    "Carnes y Embutidos":"🥩",
    "Frutas y Verduras": "🥦",
    "Aseo del Hogar":    "🧹",
    "Higiene Personal":  "🧴",
    "Congelados":        "🧊",
    "Snacks y Dulces":   "🍫",
    "Condimentos y Salsas":"🫙",
  };
  return mapa[cat] ?? "📦";
};

const badgeStock = cantidad => {
  if (cantidad == null) return null;
  if (cantidad <= 0)  return <span className="cli-badge cli-badge-out">Sin stock</span>;
  if (cantidad < 15)  return <span className="cli-badge cli-badge-warn">Poco stock</span>;
  return               <span className="cli-badge cli-badge-ok">Disponible</span>;
};

// ─── Datos del equipo (estáticos) ─────────────────────────────
const EQUIPO = [
  { nombre: "Carlos Mendoza",  cargo: "Gerente General",      inicial: "CM", color: "#2563eb" },
  { nombre: "Ana Torres",      cargo: "Jefa de Inventario",   inicial: "AT", color: "#16a34a" },
  { nombre: "Luis Pérez",      cargo: "Encargado de Bodega",  inicial: "LP", color: "#d97706" },
  { nombre: "María González",  cargo: "Atención al Cliente",  inicial: "MG", color: "#7c3aed" },
];

// ─── Formulario de contacto ───────────────────────────────────
const FORM_VACIO = { nombre: "", email: "", telefono: "", tipo: "CONSULTA", mensaje: "" };

function FormularioContacto() {
  const [form,      setForm]      = useState(FORM_VACIO);
  const [enviando,  setEnviando]  = useState(false);
  const [exito,     setExito]     = useState(false);
  const [error,     setError]     = useState("");

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) { setError("El nombre es obligatorio.");   return; }
    if (!form.email.trim())  { setError("El email es obligatorio.");    return; }
    if (!form.mensaje.trim()){ setError("El mensaje es obligatorio.");  return; }

    setEnviando(true);
    try {
      const res = await fetch(`${API}/solicitudes`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setForm(FORM_VACIO);
      setExito(true);
      setTimeout(() => setExito(false), 5000);
    } catch (err) {
      setError("No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="cli-form-grid">
        <div className="cli-field">
          <label className="cli-label">Nombre *</label>
          <input className="cli-input" name="nombre" value={form.nombre}
            onChange={handleChange} placeholder="Tu nombre completo" />
        </div>
        <div className="cli-field">
          <label className="cli-label">Email *</label>
          <input className="cli-input" name="email" type="email" value={form.email}
            onChange={handleChange} placeholder="tu@email.com" />
        </div>
        <div className="cli-field">
          <label className="cli-label">Teléfono</label>
          <input className="cli-input" name="telefono" value={form.telefono}
            onChange={handleChange} placeholder="+56 9 1234 5678" />
        </div>
        <div className="cli-field">
          <label className="cli-label">Tipo de solicitud</label>
          <select className="cli-select" name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="CONSULTA">Consulta</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="SUGERENCIA">Sugerencia</option>
          </select>
        </div>
        <div className="cli-field cli-field-full">
          <label className="cli-label">Mensaje *</label>
          <textarea className="cli-input cli-textarea" name="mensaje" value={form.mensaje}
            onChange={handleChange} placeholder="Escribe tu mensaje aquí…" />
        </div>
      </div>

      {error  && <div className="cli-msg-err">⚠ {error}</div>}
      {exito  && <div className="cli-msg-ok">✓ Solicitud enviada correctamente. Te contactaremos pronto.</div>}

      <button type="submit" className="cli-submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}

// ─── Componente principal ─────────────────────────────────────
export default function Cliente() {
  const { data: productos } = useFetch("/productos");
  const { data: stocks }    = useFetch("/stocks");
  const { data: bodegas }   = useFetch("/bodegas");

  // Cruzar stock con productos
  const stockDeProducto = id => {
    if (!stocks) return null;
    const regs = stocks.filter(s => s.producto?.id === id);
    return regs.reduce((acc, s) => acc + (s.cantidadDisponible ?? 0), 0);
  };

  const scrollA = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="cliente-wrap">

      {/* ── Header ── */}
      <header className="cli-header">
        <div className="cli-logo">
          <div className="cli-logo-icon">🛒</div>
          <span className="cli-logo-text">Super<span>NOVA</span></span>
        </div>
        <nav className="cli-nav">
          <a href="#inicio"    onClick={e => { e.preventDefault(); scrollA("inicio");    }}>Inicio</a>
          <a href="#productos" onClick={e => { e.preventDefault(); scrollA("productos"); }}>Productos</a>
          <a href="#equipo"    onClick={e => { e.preventDefault(); scrollA("equipo");    }}>Equipo</a>
          <a href="#sucursales"onClick={e => { e.preventDefault(); scrollA("sucursales");}}>Sucursales</a>
          <a href="#contacto"  onClick={e => { e.preventDefault(); scrollA("contacto");  }}>Contacto</a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section id="inicio" className="cli-hero">
        <h1>Bienvenido a Super<span>NOVA</span></h1>
        <p>Tu supermercado de confianza con los mejores productos frescos, al mejor precio. Calidad garantizada en cada compra.</p>
        <div className="cli-hero-btns">
          <button className="btn-primary-cli"   onClick={() => scrollA("productos")}>Ver productos</button>
          <button className="btn-secondary-cli" onClick={() => scrollA("contacto")}>Contáctanos</button>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="cli-stats">
        <div className="cli-stat">
          <div className="cli-stat-num">{productos ? productos.length : "…"}+</div>
          <div className="cli-stat-lbl">Productos disponibles</div>
        </div>
        <div className="cli-stat">
          <div className="cli-stat-num">{bodegas ? bodegas.length : "…"}</div>
          <div className="cli-stat-lbl">Sucursales</div>
        </div>
        <div className="cli-stat">
          <div className="cli-stat-num">10+</div>
          <div className="cli-stat-lbl">Categorías</div>
        </div>
        <div className="cli-stat">
          <div className="cli-stat-num">6:00–22:00</div>
          <div className="cli-stat-lbl">Horario de atención</div>
        </div>
      </div>

      {/* ── Productos ── */}
      <section id="productos" className="cli-section">
        <h2 className="cli-section-title">Nuestros productos</h2>
        <p className="cli-section-sub">
          Catálogo actualizado en tiempo real desde nuestro inventario
        </p>
        <div className="cli-productos-grid">
          {(productos ?? []).map(p => {
            const cant = stockDeProducto(p.id);
            return (
              <div key={p.id} className="cli-prod-card">
                <div className="cli-prod-icon">
                  {iconoPorCategoria(p.categoria?.Nombre_Categoria)}
                </div>
                <div className="cli-prod-nombre">{p.nombre}</div>
                <div className="cli-prod-cat">{p.categoria?.Nombre_Categoria || "—"}</div>
                <div className="cli-prod-precio">{fmtPrecio(p.precioVenta)}</div>
                {badgeStock(cant)}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Equipo ── */}
      <div id="equipo" className="cli-divider">
        <section className="cli-section">
          <h2 className="cli-section-title">Nuestro equipo</h2>
          <p className="cli-section-sub">Las personas detrás de SuperNOVA</p>
          <div className="cli-equipo-grid">
            {EQUIPO.map((m, i) => (
              <div key={i} className="cli-equipo-card">
                <div className="cli-avatar" style={{ background: m.color }}>
                  {m.inicial}
                </div>
                <div className="cli-equipo-nombre">{m.nombre}</div>
                <div className="cli-equipo-cargo">{m.cargo}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Sucursales / Mapa ── */}
      <section id="sucursales" className="cli-section">
        <h2 className="cli-section-title">Nuestras sucursales</h2>
        <p className="cli-section-sub">Encuéntranos en Santiago</p>
        <div className="cli-mapa-grid">
          {(bodegas ?? []).map(b => (
            <div key={b.id} className="cli-sucursal-card">
              <div className="cli-sucursal-icon">🏪</div>
              <div>
                <div className="cli-sucursal-nombre">{b.sucursal}</div>
                <div className="cli-sucursal-dir">📍 {b.direccion}</div>
                <div className="cli-sucursal-hrs">Lun–Dom · 8:00–22:00</div>
              </div>
            </div>
          ))}
        </div>
        {/* Mapa embebido de Santiago */}
        <div className="cli-mapa-embed">
          <iframe
            title="Ubicación SuperNOVA"
            width="100%"
            height="300"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            allowFullScreen
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.0!2d-70.6127!3d-33.5678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d0677c7d2355%3A0xa7aef48469ddd461!2sDuoc%20UC%20Plaza%20Vespucio!5e0!3m2!1ses!2scl!4v1700000000000"
          />
        </div>
      </section>

      {/* ── Formulario de contacto ── */}
      <div id="contacto" className="cli-form-wrap">
        <div className="cli-form-inner">
          <h2 className="cli-form-title">¿Tienes alguna consulta?</h2>
          <p className="cli-form-sub">
            Escríbenos y te responderemos a la brevedad. Todas las solicitudes quedan registradas para seguimiento.
          </p>
          <FormularioContacto />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="cli-footer">
        <span className="cli-footer-logo">Super<span>NOVA</span></span>
        <span className="cli-footer-copy">
          © {new Date().getFullYear()} Supermercado NOVA · Santiago, Chile
        </span>
      </footer>

    </div>
  );
}