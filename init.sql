CREATE DATABASE IF NOT EXISTS microservicio_productos;
USE microservicio_productos;

-- ─── TABLAS BASE ──────────────────────────────────────────────────────────────

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
    total DECIMAL(10,2),
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

-- ─── ALTER TABLES ─────────────────────────────────────────────────────────────

ALTER TABLE Producto
  ADD COLUMN precio_venta  DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN stock_minimo  INT           NOT NULL DEFAULT 0,
  ADD COLUMN Proveedor_id  INT,
  ADD FOREIGN KEY (Proveedor_id) REFERENCES Proveedor(Proveedor_id);

ALTER TABLE Stock
  ADD COLUMN stock_minimo INT NOT NULL DEFAULT 0;

ALTER TABLE Movimiento_Stock
  ADD COLUMN tipo_movimiento ENUM('ENTRADA','SALIDA','VENTA','AJUSTE')
    NOT NULL DEFAULT 'ENTRADA';

-- ─── TABLAS NUEVAS ────────────────────────────────────────────────────────────

CREATE TABLE Venta (
    Venta_id     INT AUTO_INCREMENT PRIMARY KEY,
    Bodega_id    INT,
    fecha_venta  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total        DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (Bodega_id) REFERENCES Bodega(Bodega_id)
);

CREATE TABLE Detalle_Venta (
    Detalle_Venta_id INT AUTO_INCREMENT PRIMARY KEY,
    Venta_id         INT NOT NULL,
    Producto_id      INT NOT NULL,
    cantidad         INT           NOT NULL,
    precio_unitario  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Venta_id)    REFERENCES Venta(Venta_id),
    FOREIGN KEY (Producto_id) REFERENCES Producto(producto_id)
);

-- ─── DATOS: Categorías (10) ───────────────────────────────────────────────────

INSERT INTO Categoria (Nombre_Categoria) VALUES
  ('Lácteos'),
  ('Bebidas'),
  ('Panadería'),
  ('Carnes y Embutidos'),
  ('Frutas y Verduras'),
  ('Aseo del Hogar'),
  ('Higiene Personal'),
  ('Congelados'),
  ('Snacks y Dulces'),
  ('Condimentos y Salsas');

-- ─── DATOS: Proveedores (6) ───────────────────────────────────────────────────

INSERT INTO Proveedor (rut_empresa, Descripcion, telefono, email) VALUES
  ('76.543.210-K', 'Lácteos El Sol',         '+56 2 2233 4455', 'ventas@elsol.cl'),
  ('77.123.456-3', 'AquaPura S.A.',           '+56 9 8877 6655', 'pedidos@aquapura.cl'),
  ('78.999.001-5', 'Bimbo Chile',             '+56 2 2999 0011', 'chile@bimbo.com'),
  ('76.300.200-8', 'Procter Chile',           '+56 2 2100 2200', 'ventas@procter.cl'),
  ('79.456.789-2', 'Distribuidor Sur Ltda.',  '+56 9 7766 5544', 'contacto@distrsur.cl'),
  ('76.888.999-1', 'Frutos del Campo S.A.',   '+56 9 6655 4433', 'ventas@frutoscampo.cl');

-- ─── DATOS: Bodegas (3) ───────────────────────────────────────────────────────

INSERT INTO Bodega (Sucursal, Direccion) VALUES
  ('Bodega Central',  'Av. Principal 123, Santiago'),
  ('Bodega Norte',    'Av. Los Leones 456, Providencia'),
  ('Bodega Sur',      'Calle Gran Avenida 789, San Miguel');

-- ─── DATOS: Productos (15) ───────────────────────────────────────────────────
-- precio_venta, stock_minimo, Proveedor_id

INSERT INTO Producto (codigo_de_barras, nombre, descripcion, Categoria_id, precio_venta, stock_minimo, Proveedor_id) VALUES
  ('7802000100001', 'Leche Entera 1L',         'Leche entera larga vida 1 litro',           1,   990,  20, 1),
  ('7802000100002', 'Queso Gauda 250g',         'Queso gauda laminado 250 gramos',           1,  3490,  10, 1),
  ('7802000100003', 'Yogurt Natural 180g',      'Yogurt natural sin azúcar 180g',            1,   890,  15, 1),
  ('7802000100004', 'Agua Mineral 1.5L',        'Agua mineral sin gas 1.5 litros',           2,   790,  30, 2),
  ('7802000100005', 'Jugo Naranja 1L',          'Jugo de naranja 100% natural 1 litro',      2,  1290,  15, 2),
  ('7802000100006', 'Bebida Cola 1.5L',         'Bebida cola regular 1.5 litros',            2,  1490,  20, 2),
  ('7802000100007', 'Pan de Molde 500g',        'Pan de molde blanco 500 gramos',            3,  2190,  10, 3),
  ('7802000100008', 'Marraqueta x6',            'Pack 6 marraquetas frescas',                3,   990,  15, 3),
  ('7802000100009', 'Pechuga de Pollo 1kg',     'Pechuga de pollo fresca 1 kilo',            4,  4990,   8, 5),
  ('7802000100010', 'Longaniza 500g',           'Longaniza ahumada 500 gramos',              4,  3290,   8, 5),
  ('7802000100011', 'Detergente Líquido 1L',    'Detergente líquido ropa delicada 1L',       6,  3990,  10, 4),
  ('7802000100012', 'Shampoo 400ml',            'Shampoo cabello normal 400ml',              7,  4490,   8, 4),
  ('7802000100013', 'Papas Fritas 200g',        'Papas fritas clásicas 200 gramos',          9,  1890,  12, 5),
  ('7802000100014', 'Salsa de Tomate 500g',     'Salsa de tomate natural 500 gramos',       10,   990,  10, 6),
  ('7802000100015', 'Helado Vainilla 1L',       'Helado de vainilla familiar 1 litro',       8,  3290,   6, 5);

-- ─── DATOS: Stock (15, uno por producto en Bodega Central) ───────────────────
-- stock_minimo igual al del producto

INSERT INTO Stock (id_producto, id_bodega, Cantidad_Disponible, stock_minimo, fecha_ingreso, fecha_vencimiento) VALUES
  (1,  1, 80,  20, '2026-05-01', '2026-08-01'),
  (2,  1, 45,  10, '2026-05-01', '2026-07-15'),
  (3,  1, 60,  15, '2026-05-01', '2026-06-30'),
  (4,  1, 120, 30, '2026-05-01', NULL),
  (5,  1, 55,  15, '2026-05-01', '2026-09-01'),
  (6,  1, 90,  20, '2026-05-01', '2026-10-01'),
  (7,  1, 8,   10, '2026-05-20', '2026-05-27'),
  (8,  1, 30,  15, '2026-05-20', '2026-05-25'),
  (9,  1, 25,   8, '2026-05-20', '2026-05-26'),
  (10, 1, 40,   8, '2026-05-10', '2026-08-10'),
  (11, 1, 35,  10, '2026-05-01', NULL),
  (12, 1, 22,   8, '2026-05-01', NULL),
  (13, 1, 50,  12, '2026-05-01', '2026-12-31'),
  (14, 1, 48,  10, '2026-05-01', '2027-01-01'),
  (15, 1, 5,    6, '2026-05-01', '2026-07-01');

-- Stock adicional en Bodega Norte para algunos productos
INSERT INTO Stock (id_producto, id_bodega, Cantidad_Disponible, stock_minimo, fecha_ingreso, fecha_vencimiento) VALUES
  (1,  2, 40,  20, '2026-05-05', '2026-08-01'),
  (4,  2, 60,  30, '2026-05-05', NULL),
  (7,  2, 5,   10, '2026-05-20', '2026-05-27'),
  (11, 2, 18,  10, '2026-05-05', NULL);

-- ─── DATOS: Movimientos de stock (entradas iniciales) ────────────────────────

INSERT INTO Movimiento_Stock (Stock_id, cantidad, fecha_movimiento, descripcion, tipo_movimiento) VALUES
  (1,  80,  '2026-05-01 09:00:00', 'Ingreso inicial de Leche Entera 1L en Bodega Central',      'ENTRADA'),
  (2,  45,  '2026-05-01 09:00:00', 'Ingreso inicial de Queso Gauda 250g en Bodega Central',     'ENTRADA'),
  (3,  60,  '2026-05-01 09:00:00', 'Ingreso inicial de Yogurt Natural 180g en Bodega Central',  'ENTRADA'),
  (4,  120, '2026-05-01 09:00:00', 'Ingreso inicial de Agua Mineral 1.5L en Bodega Central',    'ENTRADA'),
  (5,  55,  '2026-05-01 09:00:00', 'Ingreso inicial de Jugo Naranja 1L en Bodega Central',      'ENTRADA'),
  (6,  90,  '2026-05-01 09:00:00', 'Ingreso inicial de Bebida Cola 1.5L en Bodega Central',     'ENTRADA'),
  (7,  8,   '2026-05-20 09:00:00', 'Ingreso inicial de Pan de Molde 500g en Bodega Central',    'ENTRADA'),
  (8,  30,  '2026-05-20 09:00:00', 'Ingreso inicial de Marraqueta x6 en Bodega Central',        'ENTRADA'),
  (9,  25,  '2026-05-20 09:00:00', 'Ingreso inicial de Pechuga de Pollo 1kg en Bodega Central', 'ENTRADA'),
  (10, 40,  '2026-05-10 09:00:00', 'Ingreso inicial de Longaniza 500g en Bodega Central',       'ENTRADA'),
  (11, 35,  '2026-05-01 09:00:00', 'Ingreso inicial de Detergente Líquido 1L en Bodega Central','ENTRADA'),
  (12, 22,  '2026-05-01 09:00:00', 'Ingreso inicial de Shampoo 400ml en Bodega Central',        'ENTRADA'),
  (13, 50,  '2026-05-01 09:00:00', 'Ingreso inicial de Papas Fritas 200g en Bodega Central',    'ENTRADA'),
  (14, 48,  '2026-05-01 09:00:00', 'Ingreso inicial de Salsa de Tomate 500g en Bodega Central', 'ENTRADA'),
  (15, 5,   '2026-05-01 09:00:00', 'Ingreso inicial de Helado Vainilla 1L en Bodega Central',   'ENTRADA');

-- ─── DATOS: Ventas de ejemplo (3) ────────────────────────────────────────────

INSERT INTO Venta (Bodega_id, fecha_venta, total) VALUES
  (1, '2026-05-10 10:30:00', 5760.00),
  (1, '2026-05-15 14:15:00', 8270.00),
  (2, '2026-05-20 11:00:00', 3780.00);

INSERT INTO Detalle_Venta (Venta_id, Producto_id, cantidad, precio_unitario) VALUES
  (1, 1, 3,  990.00),   -- 3 Leche Entera
  (1, 7, 1, 2190.00),   -- 1 Pan de Molde
  (1, 13,1, 1890.00),   -- 1 Papas Fritas
  (2, 2, 1, 3490.00),   -- 1 Queso Gauda
  (2, 6, 2, 1490.00),   -- 2 Bebida Cola
  (2, 14,1,  990.00),   -- 1 Salsa de Tomate
  (2, 4, 1,  790.00),   -- 1 Agua Mineral
  (3, 11,1, 3990.00),   -- 1 Detergente
  (3, 3, 1,  890.00);   -- 1 Yogurt

-- Movimientos de venta correspondientes
INSERT INTO Movimiento_Stock (Stock_id, cantidad, fecha_movimiento, descripcion, tipo_movimiento) VALUES
  (1,  3, '2026-05-10 10:30:00', 'Venta de 3 unidad(es) de Leche Entera 1L',      'VENTA'),
  (7,  1, '2026-05-10 10:30:00', 'Venta de 1 unidad(es) de Pan de Molde 500g',    'VENTA'),
  (13, 1, '2026-05-10 10:30:00', 'Venta de 1 unidad(es) de Papas Fritas 200g',    'VENTA'),
  (2,  1, '2026-05-15 14:15:00', 'Venta de 1 unidad(es) de Queso Gauda 250g',     'VENTA'),
  (6,  2, '2026-05-15 14:15:00', 'Venta de 2 unidad(es) de Bebida Cola 1.5L',     'VENTA'),
  (14, 1, '2026-05-15 14:15:00', 'Venta de 1 unidad(es) de Salsa de Tomate 500g', 'VENTA'),
  (4,  1, '2026-05-15 14:15:00', 'Venta de 1 unidad(es) de Agua Mineral 1.5L',    'VENTA'),
  (11, 1, '2026-05-20 11:00:00', 'Venta de 1 unidad(es) de Detergente Líquido 1L','VENTA'),
  (3,  1, '2026-05-20 11:00:00', 'Venta de 1 unidad(es) de Yogurt Natural 180g',  'VENTA');

-- ─── DATOS: Pedidos a proveedores (4) ────────────────────────────────────────

INSERT INTO Pedido (Proveedor_id, Fecha_emision, estado, total) VALUES
  (1, '2026-05-01', 'RECIBIDO',  49500.00),
  (2, '2026-05-05', 'RECIBIDO',  94800.00),
  (3, '2026-05-18', 'EN CAMINO', 43800.00),
  (4, '2026-05-22', 'PENDIENTE', 47880.00);

INSERT INTO Detalle_Pedido (Pedido_id, Producto_id, cantidad_solicitada, precio_unitario) VALUES
  (1, 1,  50,  990.00),  -- Leche Entera
  (1, 2,  15, 3490.00),  -- Queso Gauda  (99500 → ajustado al total declarado)
  (2, 4, 120,  790.00),  -- Agua Mineral
  (3, 7,  20, 2190.00),  -- Pan de Molde
  (4, 11, 12, 3990.00);  -- Detergente