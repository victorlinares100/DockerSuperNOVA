import { useState } from "react";
import "./App.css";

import Navbar       from "./components/Navbar";
import Footer       from "./components/Footer";
import Inicio       from "./pages/Inicio";
import Productos    from "./pages/Productos";
import Categorias   from "./pages/Categorias";
import Proveedores  from "./pages/Proveedores";
import Bodegas      from "./pages/Bodegas";
import Pedidos      from "./pages/Pedidos";
import Stock        from "./pages/Stock";
import Ventas       from "./pages/Ventas";
import Movimientos  from "./pages/Movimientos";

export default function App() {
  const [pagina, setPagina] = useState("inicio");

  const renderPagina = () => {
    switch (pagina) {
      case "inicio":       return <Inicio />;
      case "productos":    return <Productos />;
      case "categorias":   return <Categorias />;
      case "proveedores":  return <Proveedores />;
      case "bodegas":      return <Bodegas />;
      case "pedidos":      return <Pedidos />;
      case "stock":        return <Stock />;
      case "ventas":       return <Ventas />;
      case "movimientos":  return <Movimientos />;
      default:             return <Inicio />;
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