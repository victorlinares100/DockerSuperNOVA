import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from "chart.js";

// Registramos los componentes para un gráfico de barras
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function GraficoVentasMensual({ ventas }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!ventas || ventas.length === 0) return;

    // ── 1. Estructuras para agrupar datos ──────────────────────────────
    // agrupado = { "2026-05": { "Lácteos": 15000, "Bebidas": 4000 }, "2026-06": { ... } }
    const agrupado = {};
    const categoriasSet = new Set(); // Para saber cuántas categorías únicas hay

    ventas.forEach(v => {
      if (!v.fechaVenta || !v.detalles) return;

      // Extraer el Año-Mes (YYYY-MM)
      let mesAnio = "";
      if (typeof v.fechaVenta === "string") {
        mesAnio = v.fechaVenta.substring(0, 7); 
      } else if (Array.isArray(v.fechaVenta)) {
        mesAnio = `${v.fechaVenta[0]}-${String(v.fechaVenta[1]).padStart(2, '0')}`;
      }

      if (!agrupado[mesAnio]) agrupado[mesAnio] = {};

      // Recorrer los detalles para sumar por categoría
      v.detalles.forEach(detalle => {
        // En tu backend la propiedad suele llamarse Nombre_Categoria o nombre
        const catName = detalle.producto?.categoria?.nombre_Categoria 
                     || detalle.producto?.categoria?.nombre 
                     || "Sin Categoría";
        
        categoriasSet.add(catName);

        const subtotal = detalle.cantidad * detalle.precioUnitario;
        agrupado[mesAnio][catName] = (agrupado[mesAnio][catName] || 0) + subtotal;
      });
    });

    // ── 2. Preparar los Ejes y Datasets para Chart.js ──────────────────
    // Ordenar los meses cronológicamente (Ej: ["2026-05", "2026-06"])
    const mesesOrdenados = Object.keys(agrupado).sort();
    
    // Formatear los meses para que se vean bonitos (Opcional, ej: "Mayo 2026")
    const nombresMeses = mesesOrdenados.map(m => {
      const [year, month] = m.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    });

    const categoriasArray = Array.from(categoriasSet);

    // Paleta de colores para las diferentes categorías
    const colores = [
      "#2563eb", "#16a34a", "#d97706", "#dc2626", 
      "#7c3aed", "#0891b2", "#be185d", "#65a30d"
    ];

    // Crear un dataset (grupo de barras) por cada categoría
    const datasets = categoriasArray.map((cat, index) => {
      return {
        label: cat,
        // Buscar el valor de esta categoría en cada mes, si no hay, poner 0
        data: mesesOrdenados.map(mes => agrupado[mes][cat] || 0),
        backgroundColor: colores[index % colores.length],
        borderRadius: 4,
      };
    });

    // ── 3. Renderizar el Gráfico ───────────────────────────────────────
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar", // Gráfico de barras agrupadas
      data: {
        labels: nombresMeses, // El eje X son los meses
        datasets: datasets    // Las barras son las categorías
      },
      options: {
        responsive: true,
        plugins: {
          legend: { 
            display: true, // Mostrar la leyenda para saber qué color es cada categoría
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } }
          },
          title: {
            display: true,
            text: "Reporte Mensual de Ventas por Categoría",
            font: { size: 14, weight: "600" },
            color: "#0f2044",
            padding: { bottom: 16 },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, color: "#6b7280" },
            grid:  { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { 
              font: { size: 11 }, color: "#6b7280",
              callback: value => "$" + value.toLocaleString()
            },
            grid:  { color: "#e4e7ec" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [ventas]);

  if (!ventas || ventas.length === 0) {
    return <p className="state-msg">No hay datos de ventas disponibles…</p>;
  }

  return <canvas ref={canvasRef} style={{ maxHeight: 350 }} />;
}