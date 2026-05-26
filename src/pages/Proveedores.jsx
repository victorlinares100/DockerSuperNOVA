import useFetch from "../hooks/useFetch";
import PageHeader from "../molecules/PageHeader";
import StateMsg from "../atoms/StateMsg";
import "../css/Proveedores.css"; 

const COLORES = [
  { bg: "#dbeafe", fg: "#1e40af" },
  { bg: "#dcfce7", fg: "#166534" },
  { bg: "#fef9c3", fg: "#854d0e" },
  { bg: "#fee2e2", fg: "#991b1b" },
  { bg: "#f3e8ff", fg: "#6b21a8" },
];

export default function Proveedores() {
  const { data, loading, error } = useFetch("/proveedores");

  return (
    <div className="page-wrapper">
      <PageHeader 
        title="Proveedores" 
        sub="Empresas que abastecen el supermercado" 
      />

      <StateMsg loading={loading} error={error} />

      {!loading && !error && (
        <div className="cards-grid">
          {(data ?? []).map((pr, i) => {
            const { bg, fg } = COLORES[i % COLORES.length];
            const iniciales = (pr.rutEmpresa ?? "??").slice(0, 2).toUpperCase();
            
            return (
              <div key={pr.id} className="info-card">
                <div className="avatar" style={{ background: bg, color: fg }}>
                  {iniciales}
                </div>
                
                <div className="info-card-content">
                  <div className="info-card-name">
                    {pr.descripcion || `Proveedor ${pr.id}`}
                  </div>
                  <div className="info-card-sub">RUT: {pr.rutEmpresa || "—"}</div>
                  <div className="info-card-meta">
                    <span>{pr.email    || "—"}</span>
                    <span>{pr.telefono || "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {data?.length === 0 && (
            <p className="state-msg">Sin proveedores registrados</p>
          )}
        </div>
      )}
    </div>
  );
}