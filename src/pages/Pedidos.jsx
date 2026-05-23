import useFetch from "../hooks/useFetch";
import Badge from "../components/Badge";

export default function Pedidos() {
  const { data, loading, error } = useFetch("/pedidos");

  const fmt = fecha =>
    fecha ? new Date(fecha).toLocaleDateString("es-CL") : "—";

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Pedidos a proveedores</h1>
      <p className="page-sub">Órdenes de compra registradas en el sistema</p>

      <div className="card">
        {loading && <p className="state-msg">Cargando…</p>}
        {error   && <p className="state-msg state-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Proveedor</th>
                  <th>Fecha emisión</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).length === 0
                  ? <tr><td colSpan={5} className="state-msg">Sin pedidos registrados</td></tr>
                  : (data ?? []).map(p => (
                      <tr key={p.id}>
                        <td className="td-mono">#{p.id}</td>
                        <td style={{ fontWeight: 500 }}>
                          {p.proveedor?.descripcion || "Proveedor " + (p.proveedor?.id ?? "—")}
                        </td>
                        <td>{fmt(p.fechaEmision)}</td>
                        <td className="td-mono">
                          ${(p.total ?? 0).toLocaleString("es-CL")}
                        </td>
                        <td><Badge tipo={p.estado} /></td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
