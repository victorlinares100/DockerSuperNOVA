import useFetch from "../hooks/useFetch";

export default function Categorias() {
  const { data, loading, error } = useFetch("/categorias");

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Categorías</h1>
      <p className="page-sub">Clasificación de productos del supermercado</p>

      <div className="card">
        {loading && <p className="state-msg">Cargando…</p>}
        {error   && <p className="state-msg state-error">Error: {error}</p>}
        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre de categoría</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map(c => (
                  <tr key={c.id}>
                    <td className="td-mono">{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.Nombre_Categoria}</td>
                  </tr>
                ))}
                {data?.length === 0 && (
                  <tr><td colSpan={2} className="state-msg">Sin categorías registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
