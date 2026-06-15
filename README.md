# SuperNOVA — Frontend

Sistema de gestión de inventario para supermercado, desarrollado en React y desplegado con Docker.

## Tecnologías utilizadas

- React 
- JavaScript 
- CSS personalizado con variables
- SheetJS (xlsx) — exportación a Excel
- Recharts — gráficos y dashboards
- Docker — despliegue en contenedor

## Puertos del sistema
Frontend (React) : 8090 
MS Inventario (Spring Boot) : 8081 
MS Clientes (Spring Boot) : 8082 
MariaDB Inventario : 3307 
MariaDB Clientes : 3308 

## Estructura del proyecto
src/

- pages/          # Vistas principales (Inicio, Productos, Stock, etc.)

- components/     # Gráficos y componentes reutilizables

-  atoms/          # Componentes básicos (DataTable, Badge, etc.)

-  molecules/      # Componentes compuestos (PageHeader, etc.)

-  hooks/          # useFetch — comunicación con los microservicios

-  css/            # Estilos por módulo

public/             # Archivos estáticos

## Requisitos previos

- Docker Desktop instalado y corriendo
- Los microservicios ms-inventario y ms-cliente deben estar activos

## Levantar el proyecto

```bash
docker compose up --build
```

## Bajar el proyecto

```bash
docker compose down -v
```

## Acceder al sistema

Una vez levantado, abrir en el navegador:http://localhost:8090/

## Funcionalidades principales

- Dashboard con KPIs y gráficos de ventas y stock
- Gestión de productos con edición y búsqueda
- Control de stock por bodega con alertas de stock bajo
- Registro de ventas y movimientos (entradas, salidas)
- Gestión de pedidos a proveedores
- Exportación de datos a Excel
- Vista cliente con formulario de solicitudes
- Notificaciones en tiempo real de stock bajo
