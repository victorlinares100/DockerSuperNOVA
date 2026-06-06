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

export default function App() {
  const [pagina, setPagina] = useState("inicio");

  if (pagina === "cliente") {
    return (
      <>
        <button
          onClick={() => setPagina("inicio")}
          style={{
            position: "fixed", top: 12, right: 16, zIndex: 999,
            padding: "6px 14px", fontSize: 12, fontWeight: 600,
            background: "#fff", color: "#0f2044",
            border: "1px solid #e4e7ec", borderRadius: 8,
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.12)",
          }}
        >
          ← Vista Admin
        </button>
        <Cliente />
      </>
    );
  }

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
      <Navbar pagina={pagina} setPagina={setPagina} />
      <main style={{ flex: 1 }}>{renderPagina()}</main>
      <Footer />
    </>
  );
}