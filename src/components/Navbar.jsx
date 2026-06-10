const LINKS = [
  { id: "inicio",        label: "Inicio" },
  { id: "productos",     label: "Productos" },
  { id: "stock",         label: "Stock" },
  { id: "ventas",        label: "Ventas" },
  { id: "movimientos",   label: "Movimientos" },
  { id: "pedidos",       label: "Pedidos" },
  { id: "solicitudes",   label: "Solicitudes" },
  { id: "configuracion", label: "Configuración" },
];

export default function Navbar({ pagina, setPagina }) {
  return (
    <header style={{
      background: "var(--navy)", borderBottom: "1px solid var(--navy-light)",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 12px rgba(0,0,0,.25)"
    }}>
      <div style={{
        maxWidth: 1300, margin: "0 auto", padding: "0 24px",
        height: 62, display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>
        <button onClick={() => setPagina("inicio")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em",
          color: "#fff", fontFamily: "var(--font)", whiteSpace: "nowrap",
        }}>
          Super<span style={{ color: "#60a5fa" }}>NOVA</span>
        </button>

        <nav style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {LINKS.map(l => (
            <button key={l.id} onClick={() => setPagina(l.id)} style={{
              background: pagina === l.id ? "rgba(255,255,255,.12)" : "none",
              border: "none", cursor: "pointer",
              padding: "6px 10px", borderRadius: "var(--radius)",
              fontSize: 12,
              fontWeight: pagina === l.id ? 600 : 400,
              color: pagina === l.id ? "#fff" : "rgba(255,255,255,.70)",
              fontFamily: "var(--font)", transition: "background .15s, color .15s",
            }}
            onMouseEnter={e => { if (pagina !== l.id) e.target.style.color = "#fff"; }}
            onMouseLeave={e => { if (pagina !== l.id) e.target.style.color = "rgba(255,255,255,.70)"; }}>
              {l.label}
            </button>
          ))}

          <button onClick={() => setPagina("cliente")} style={{
            marginLeft: 8,
            background: "#2563eb",
            border: "none", cursor: "pointer",
            padding: "7px 14px", borderRadius: "var(--radius)",
            fontSize: 12, fontWeight: 600,
            color: "#fff", fontFamily: "var(--font)",
            whiteSpace: "nowrap",
          }}>
            Vista Cliente
          </button>
        </nav>
      </div>
    </header>
  );
}
