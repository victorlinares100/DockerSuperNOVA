import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function GraficoVentas({ ventas }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!ventas || ventas.length === 0) return;

    const porDia = {};
    
    ventas.forEach(v => {
      if (!v.fechaVenta) return;
      
      let fecha = "";
      if (typeof v.fechaVenta === "string") {
        fecha = v.fechaVenta.split("T")[0]; 
      } else if (Array.isArray(v.fechaVenta)) {
        const [year, month, day] = v.fechaVenta;
        fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      const monto = v.total ?? 0;
      porDia[fecha] = (porDia[fecha] ?? 0) + monto;
    });

    const fechasOrdenadas = Object.keys(porDia).sort();
    const valores = fechasOrdenadas.map(f => porDia[f]);

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: fechasOrdenadas,
        datasets: [{
          label: "Ventas Diarias ($)",
          data: valores,
          borderColor: "#2563eb",       
          backgroundColor: "#2563eb22", 
          borderWidth: 3,
          tension: 0.3,                 
          pointBackgroundColor: "#1d4ed8",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Tendencia de Ventas por Día",
            font: { size: 14, weight: "600" },
            color: "#0f2044",
            padding: { bottom: 16 },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` $${ctx.parsed.y.toLocaleString()}`,
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
              font: { size: 11 }, 
              color: "#6b7280",
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

  return <canvas ref={canvasRef} style={{ maxHeight: 320 }} />;
}