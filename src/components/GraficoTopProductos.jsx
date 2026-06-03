import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title
} from "chart.js";

// Registramos los componentes necesarios
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Title);

export default function GraficoTopProductos({ ventas }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!ventas || ventas.length === 0) return;

    // ── 1. Contar cantidades por producto 
    const conteo = {};

    ventas.forEach(v => {
      if (!v.detalles) return;
      v.detalles.forEach(d => {
        const nombreProd = d.producto?.nombre || "Producto Desconocido";
        conteo[nombreProd] = (conteo[nombreProd] || 0) + d.cantidad;
      });
    });

    // ── 2. Ordenar de mayor a menor y sacar el Top 5 
    const productosOrdenados = Object.entries(conteo)
      .sort((a, b) => b[1] - a[1]) // Ordenar descendente por cantidad
      .slice(0, 5);                // Tomar solo los primeros 5

    const labels = productosOrdenados.map(p => p[0]); 
    const data   = productosOrdenados.map(p => p[1]); 

    // ── 3. Renderizar Gráfico Horizontal 
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Unidades vendidas",
            data: data,
            backgroundColor: "#10b981", 
            borderRadius: 6,
            barThickness: 20 
          }
        ]
      },
      options: {
        indexAxis: "y", 
        responsive: true,
        plugins: {
          legend: { display: false }, 
          title: {
            display: true,
            text: "Top 5 Productos Más Vendidos",
            font: { size: 14, weight: "600" },
            color: "#0f2044",
            padding: { bottom: 16 }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.formattedValue} unidades`,
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { font: { size: 11 }, color: "#6b7280" },
            grid: { color: "#e4e7ec" }
          },
          y: {
            ticks: { font: { size: 11, weight: "500" }, color: "#374151" },
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [ventas]);

  if (!ventas || ventas.length === 0) {
    return <p className="state-msg">No hay datos suficientes para el Top 5.</p>;
  }

  return <canvas ref={canvasRef} style={{ maxHeight: 300 }} />;
}