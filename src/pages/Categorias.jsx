import useFetch        from "../hooks/useFetch";
import PageHeader      from "../molecules/PageHeader";
import StateMsg        from "../atoms/StateMsg";
import DataTable       from "../atoms/DataTable";
import EmptyRow        from "../atoms/EmptyRow";

const HEADERS = ["#", "Nombre de categoría"];

export default function Categorias() {
  const { data, loading, error } = useFetch("/categorias");

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Categorías"
        sub="Clasificación de productos del supermercado"
      />

      <div className="card">
        <StateMsg loading={loading} error={error} />

        {!loading && !error && (
          <DataTable headers={HEADERS}>
            {(data ?? []).length === 0
              ? <EmptyRow cols={2} mensaje="Sin categorías registradas" />
              : (data ?? []).map(c => (
                  <tr key={c.id}>
                    <td className="td-mono">{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.Nombre_Categoria}</td>
                  </tr>
                ))
            }
          </DataTable>
        )}
      </div>
    </div>
  );
}