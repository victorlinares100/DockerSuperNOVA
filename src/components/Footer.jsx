export default function Footer() {
  const año = new Date().getFullYear();
  return (
    <footer style={{
      background: "var(--navy-dark)",
      borderTop: "1px solid var(--navy-light)",
      padding: "28px 32px",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
          Super<span style={{ color: "#60a5fa" }}>NOVA</span>
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>
          © {año} Supermercado NOVA — Sistema de gestión de inventario
        </span>
      </div>
    </footer>
  );
}