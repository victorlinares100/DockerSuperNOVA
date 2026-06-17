import { useState } from "react";
import "./App.css";

import Navbar         from "./components/Navbar";
import Footer         from "./components/Footer";
import Inicio         from "./pages/Inicio";
import Productos      from "./pages/Productos";
import Configuracion  from "./pages/Configuracion";
import Pedidos        from "./pages/Pedidos";
import Stock          from "./pages/Stock";
import Ventas         from "./pages/Ventas";
import Movimientos    from "./pages/Movimientos";
import Solicitudes    from "./pages/Solicitudes";
import Cliente        from "./pages/Cliente";

const USUARIO    = "admin";
const CONTRASENA = "supernova2026";

function LoginAdmin({ onLogin, onCancelar }) {
  const [user,  setUser]  = useState("");
  const [pass,  setPass]  = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (user === USUARIO && pass === CONTRASENA) {
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "40px 48px", width: 360,
        boxShadow: "0 8px 32px rgba(0,0,0,.10)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em",
            color: "var(--navy)", fontFamily: "var(--font)",
          }}>
            Super<span style={{ color: "#2563eb" }}>NOVA</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            Acceso al panel de administración
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>
              Usuario
            </label>
            <input
              type="text"
              value={user}
              onChange={e => { setUser(e.target.value); setError(""); }}
              placeholder="admin"
              autoFocus
              style={{
                width: "100%", padding: "9px 12px",
                border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 14, fontFamily: "var(--font)",
                background: "var(--bg)", color: "var(--text)",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(""); }}
              placeholder="••••••••"
              style={{
                width: "100%", padding: "9px 12px",
                border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 14, fontFamily: "var(--font)",
                background: "var(--bg)", color: "var(--text)",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 16, textAlign: "center" }}>
              ⚠ {error}
            </p>
          )}

          <button type="submit" style={{
            width: "100%", padding: "10px",
            background: "#2563eb", color: "#fff",
            border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            fontFamily: "var(--font)", cursor: "pointer",
            marginBottom: 10,
          }}>
            Ingresar al admin
          </button>

          <button type="button" onClick={onCancelar} style={{
            width: "100%", padding: "10px",
            background: "transparent", color: "var(--muted)",
            border: "1px solid var(--border)", borderRadius: 8,
            fontSize: 14, fontFamily: "var(--font)", cursor: "pointer",
          }}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [vista,     setVista]     = useState("cliente"); 
  const [pagina,    setPagina]    = useState("inicio");
  const [pidiendo,  setPidiendo]  = useState(false);     

  // Cuando el navbar quiere ir al admin
  function irAlAdmin() {
    setPidiendo(true); 
  }

  // Login exitoso
  function loginExitoso() {
    setPidiendo(false);
    setVista("admin");
  }

  function irAlCliente() {
    setVista("cliente");
  }

  if (pidiendo) {
    return (
      <LoginAdmin
        onLogin={loginExitoso}
        onCancelar={() => setPidiendo(false)}
      />
    );
  }

  // Vista cliente
  if (vista === "cliente") {
    return (
      <>
        <button
          onClick={irAlAdmin}
          style={{
            position: "fixed", top: 12, right: 16, zIndex: 999,
            padding: "6px 14px", fontSize: 12, fontWeight: 600,
            background: "#0f2044", color: "#fff",
            border: "1px solid #1a3a6e", borderRadius: 8,
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.12)",
          }}
        >
          Vista Admin →
        </button>
        <Cliente />
      </>
    );
  }

  // Vista admin
  const renderPagina = () => {
    switch (pagina) {
      case "inicio":         return <Inicio />;
      case "productos":      return <Productos />;
      case "configuracion":  return <Configuracion />;
      case "pedidos":        return <Pedidos />;
      case "stock":          return <Stock />;
      case "ventas":         return <Ventas />;
      case "movimientos":    return <Movimientos />;
      case "solicitudes":    return <Solicitudes />;
      default:               return <Inicio />;
    }
  };

  return (
    <>
      <Navbar
        pagina={pagina}
        setPagina={setPagina}
        onIrCliente={irAlCliente}  
      />
      <main style={{ flex: 1 }}>{renderPagina()}</main>
      <Footer />
    </>
  );
}