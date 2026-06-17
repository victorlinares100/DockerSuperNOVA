export default function Footer() {
  const año = new Date().getFullYear();
  return (
    <footer style={{
      background: "var(--navy-dark)",
      borderTop: "1px solid var(--navy-light)",
      padding: "40px 32px 24px",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
      }}>

        {/* Fila superior — 3 columnas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 32, marginBottom: 32,
        }}>

          {/* Columna 1 — Marca */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Super<span style={{ color: "#60a5fa" }}>NOVA</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.50)", lineHeight: 1.7, margin: 0 }}>
              Sistema de gestión de inventario para supermercados. Desarrollado con React y Spring Boot.
            </p>
          </div>

          {/* Columna 2 — Contacto */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contacto
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.50)" }}>
                 Santiago, Chile
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.50)" }}>
                 contacto@supernova.cl
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.50)" }}>
                 +56 9 1234 5678
              </span>
            </div>
          </div>

          {/* Columna 3 — Redes sociales */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Síguenos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Instagram", url: "#" },
                { label: "Facebook",  url: "#" },
                { label: "LinkedIn",  url: "#" },
              ].map(r => (
                <a key={r.label} href={r.url} style={{
                  fontSize: 13, color: "rgba(255,255,255,.50)",
                  textDecoration: "none", transition: "color .15s",
                }}
                onMouseEnter={e => e.target.style.color = "#60a5fa"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.50)"}
                >
                  {r.label}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Línea divisoria */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,.10)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.30)" }}>
            © {año} Supermercado NOVA — Todos los derechos reservados
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.30)" }}>
            React · Spring Boot · MariaDB · Docker
          </span>
        </div>

      </div>
    </footer>
  );
}