CREATE DATABASE IF NOT EXISTS microservicio_productos;
USE microservicio_productos;


CREATE TABLE Categoria (
    Categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Categoria VARCHAR(100)
);

CREATE TABLE Proveedor (
    Proveedor_id INT AUTO_INCREMENT PRIMARY KEY,
    rut_empresa VARCHAR(20),
    Descripcion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE Bodega (
    Bodega_id INT AUTO_INCREMENT PRIMARY KEY,
    Sucursal VARCHAR(100),
    Direccion VARCHAR(200)
);


CREATE TABLE Producto (
    producto_id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_de_barras VARCHAR(50),
    nombre VARCHAR(100),
    descripcion TEXT,
    Categoria_id INT,
    FOREIGN KEY (Categoria_id) REFERENCES Categoria(Categoria_id)
);

CREATE TABLE Pedido (
    Pedido_id INT AUTO_INCREMENT PRIMARY KEY,
    Proveedor_id INT,
    Fecha_emision DATE,
    estado VARCHAR(50),
    total DECIMAL(10,2), -- DECIMAL es ideal para dinero/totales
    FOREIGN KEY (Proveedor_id) REFERENCES Proveedor(Proveedor_id)
);


CREATE TABLE Detalle_Pedido (
    Detalle_Pedido_id INT AUTO_INCREMENT PRIMARY KEY,
    Pedido_id INT,
    Producto_id INT,
    cantidad_solicitada INT,
    precio_unitario DECIMAL(10,2),
    FOREIGN KEY (Pedido_id) REFERENCES Pedido(Pedido_id),
    FOREIGN KEY (Producto_id) REFERENCES Producto(producto_id)
);

CREATE TABLE Stock (
    Stock_id INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT,
    id_bodega INT,
    Cantidad_Disponible INT,
    fecha_ingreso DATE,
    fecha_vencimiento DATE,
    FOREIGN KEY (id_producto) REFERENCES Producto(producto_id),
    FOREIGN KEY (id_bodega) REFERENCES Bodega(Bodega_id)
);


CREATE TABLE Movimiento_Stock (
    Movimiento_Stock_id INT AUTO_INCREMENT PRIMARY KEY,
    Stock_id INT,
    cantidad INT,
    fecha_movimiento DATETIME,
    descripcion TEXT,
    FOREIGN KEY (Stock_id) REFERENCES Stock(Stock_id)
);