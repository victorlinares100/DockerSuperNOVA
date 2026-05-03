import { useState, useEffect } from "react";
import "./App.css";

const App = () => {

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProd = await fetch("http://localhost:8080/api/v1/productos");
        setProductos(await resProd.json());

        const resCat = await fetch("http://localhost:8080/api/v1/categorias");
        setCategorias(await resCat.json());

        const resProv = await fetch("http://localhost:8080/api/v1/proveedores");
        setProveedores(await resProv.json());

        const resBod = await fetch("http://localhost:8080/api/v1/bodegas");
        setBodegas(await resBod.json());
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard Supermercado NOVA</h1>
        <p>Gestión de Inventario en Tiempo Real</p>
      </header>

      <main className="dashboard-grid">
        {/* Sección Productos */}
        <section className="data-card">
          <h2> Productos</h2>
          <div className="list-container">
            {productos.map(p => (
              <div key={p.id} className="item-row">
                <strong>{p.nombre}</strong> - {p.categoria?.Nombre_Categoria || 'S/C'}
              </div>
            ))}
          </div>
        </section>

        {/* Sección Categorías */}
        <section className="data-card">
          <h2> Categorías</h2>
          <div className="list-container">
            {categorias.map(c => (
              <div key={c.id} className="item-row">{c.Nombre_Categoria}</div>
            ))}
          </div>
        </section>

        {/* Sección Proveedores */}
        <section className="data-card">
          <h2> Proveedores</h2>
          <div className="list-container">
            {proveedores.map(pr => (
              <div key={pr.id} className="item-row">
                <strong>{pr.rutEmpresa}</strong> - {pr.email}
              </div>
            ))}
          </div>
        </section>

        {/* Sección Bodegas */}
        <section className="data-card">
          <h2> Bodegas</h2>
          <div className="list-container">
            {bodegas.map(b => (
              <div key={b.id} className="item-row">
                <strong>{b.sucursal}</strong> <br/> <small>{b.direccion}</small>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;