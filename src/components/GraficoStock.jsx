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

// Registrar todos los componentes necesarios incluyendo BarController
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function GraficoStock({ stocks }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!stocks || stocks.length === 0) return;

    // ── Agrupar stock por categoría ──────────────────────────────
    const porCategoria = {};
    stocks.forEach(s => {
      const cat  = s.producto?.categoria?.Nombre_Categoria ?? "Sin categoría";
      const cant = s.cantidadDisponible ?? 0;
      porCategoria[cat] = (porCategoria[cat] ?? 0) + cant;
    });

    const labels  = Object.keys(porCategoria);
    const valores = Object.values(porCategoria);

    const colores = [
      "#2563eb", "#16a34a", "#d97706", "#dc2626",
      "#7c3aed", "#0891b2", "#be185d", "#65a30d",
      "#ea580c", "#0284c7",
    ];

    // Destruir gráfico anterior si existe
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Unidades en stock",
          data: valores,
          backgroundColor: colores.slice(0, labels.length).map(c => c + "cc"),
          borderColor:     colores.slice(0, labels.length),
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Stock total por categoría",
            font: { size: 14, weight: "600" },
            color: "#0f2044",
            padding: { bottom: 16 },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} unidades`,
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 12 }, color: "#6b7280" },
            grid:  { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 12 }, color: "#6b7280" },
            grid:  { color: "#e4e7ec" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [stocks]);

  if (!stocks || stocks.length === 0) {
    return <p className="state-msg">Cargando gráfico…</p>;
  }

  return <canvas ref={canvasRef} style={{ maxHeight: 320 }} />;
}