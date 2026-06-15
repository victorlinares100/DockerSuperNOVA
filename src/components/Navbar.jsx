import useFetch from "../hooks/useFetch";
import { useState } from "react";


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
  const { data: stocks } = useFetch("/stocks");
  const [mostrarAlertas, setMostrarAlertas] = useState(false);

  const alertas = (stocks ?? []).filter(s =>
    (s.cantidadDisponible ?? 0) < (s.stockMinimo ?? 10)
  );

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
            onMouseEnter={e => { if (pagina !== l.id) e.target.style.color = "#ffffff"; }}
            onMouseLeave={e => { if (pagina !== l.id) e.target.style.color = "rgba(255, 255, 255, 0.7)"; }}>
              {l.label}
            </button>
          ))}

          <div style={{ position: "relative", marginLeft: 8 }}>
            <button
            onClick={() => setMostrarAlertas(v => !v)}
            title="Alertas de stock bajo"
            style={{
              background: "var(--navy)",
              border: "1px solid rgba(255,255,255,.20)",
              cursor: "pointer",
              width: 36, height: 36, borderRadius: "var(--radius)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", transition: "background .15s",
              color: "#ffffff",
            }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
              {alertas.length > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5,
                  background: "#ef4444", color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  width: 18, height: 18, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font)",
                }}>
                  {alertas.length}
                </span>
              )}
            </button>

            {mostrarAlertas && (
              <div style={{
                position: "absolute", top: 44, right: 0,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                minWidth: 300, maxWidth: 340, zIndex: 200,
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13, fontWeight: 600, color: "var(--navy)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>⚠ Productos con stock bajo</span>
                  <button onClick={() => setMostrarAlertas(false)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 16, color: "var(--muted)", lineHeight: 1,
                  }}>×</button>
                </div>

                {alertas.length === 0 ? (
                  <div style={{ padding: "20px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                    ✓ Todo el stock está en niveles normales
                  </div>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {alertas.map(s => (
                      <div key={s.id} style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontSize: 13,
                      }}>
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--text)" }}>
                            {s.producto?.nombre || "—"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                            Bodega ID: {s.bodegaId}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{
                            background: (s.cantidadDisponible ?? 0) <= 0 ? "#fee2e2" : "#fef9c3",
                            color:      (s.cantidadDisponible ?? 0) <= 0 ? "#991b1b" : "#854d0e",
                            fontSize: 11, fontWeight: 700,
                            padding: "2px 8px", borderRadius: 20,
                          }}>
                            {s.cantidadDisponible ?? 0} / {s.stockMinimo ?? 10} mín
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
                  <button
                    onClick={() => { setPagina("stock"); setMostrarAlertas(false); }}
                    style={{
                      width: "100%", padding: "7px", background: "var(--accent)",
                      color: "#fff", border: "none", borderRadius: "var(--radius)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font)",
                    }}
                  >
                    Ver Stock completo →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setPagina("cliente")} style={{
            marginLeft: 8, background: "#2563eb",
            border: "none", cursor: "pointer",
            padding: "7px 14px", borderRadius: "var(--radius)",
            fontSize: 12, fontWeight: 600,
            color: "#fff", fontFamily: "var(--font)", whiteSpace: "nowrap",
          }}>
            Vista Cliente
          </button>
        </nav>
      </div>
    </header>
  );
}