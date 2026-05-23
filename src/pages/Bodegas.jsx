import useFetch from "../hooks/useFetch";

export default function Bodegas() {
  const { data, loading, error } = useFetch("/bodegas");

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Bodegas</h1>
      <p className="page-sub">Sucursales y puntos de almacenamiento</p>

      {loading && <p className="state-msg">Cargando…</p>}
      {error   && <p className="state-msg state-error">Error: {error}</p>}

      {!loading && !error && (
        <div className="cards-grid">
          {(data ?? []).map(b => (
            <div key={b.id} className="info-card">
              <div className="avatar" style={{ background: "#dbeafe", color: "#1e40af", fontSize: 20 }}>
              </div>
              <div style={{ flex: 1 }}>
                <div className="info-card-name">{b.sucursal}</div>
                <div className="info-card-sub" style={{ marginTop: 6 }}>
                   {b.direccion}
                </div>
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <p className="state-msg">Sin bodegas registradas</p>
          )}
        </div>
      )}
    </div>
  );
}
