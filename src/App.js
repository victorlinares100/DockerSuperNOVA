import { useState, useEffect } from "react";
import "./App.css";
// Puedes dejar el import de Confetti si quieres, pero lo quité para mantenerlo simple por ahora

const App = () => {
  // 1. Creamos un espacio en memoria para guardar los productos
  const [productos, setProductos] = useState([]);

  // 2. Usamos useEffect para ir a buscar los datos al backend cuando cargue la página
  useEffect(() => {
    fetch("http://localhost:8080/api/v1/productos")
      .then((response) => response.json())
      .then((data) => {
        setProductos(data); // Guardamos los datos que llegaron
      })
      .catch((error) => console.error("Error al buscar productos:", error));
  }, []); // Los corchetes vacíos significan "ejecuta esto solo una vez al cargar"

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ marginBottom: "0px" }}>Supermercado NOVA</h1>
        <p style={{ marginTop: "10px", marginBottom: "50px" }}>
          Lista de Productos Disponibles
        </p>

        {/* 3. Dibujamos los productos en la pantalla */}
        <div style={{ textAlign: "left", width: "80%", maxWidth: "600px" }}>
          {productos.length > 0 ? (
            productos.map((producto) => (
              <div 
                key={producto.id} 
                style={{ 
                  border: "1px solid white", 
                  padding: "15px", 
                  marginBottom: "10px", 
                  borderRadius: "8px" 
                }}
              >
                <h3>{producto.nombre}</h3>
                <p><strong>Código de Barras:</strong> {producto.codigoDeBarras}</p>
                <p><strong>Descripción:</strong> {producto.descripcion}</p>
                <p><strong>Categoría:</strong> {producto.categoria ? producto.categoria.nombreCategoria : "Sin categoría"}</p>
              </div>
            ))
          ) : (
            <p>Cargando productos o no hay productos disponibles...</p>
          )}
        </div>
      </header>
    </div>
  );
};

export default App;