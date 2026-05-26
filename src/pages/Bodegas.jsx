import useFetch from "../hooks/useFetch";
import PageHeader from "../molecules/PageHeader";
import InfoCard   from "../molecules/InfoCard";
import StateMsg   from "../atoms/StateMsg";

export default function Bodegas() {
  const { data, loading, error } = useFetch("/bodegas");

  return (
    <div className="page-wrapper">
      <PageHeader title="Bodegas" sub="Sucursales y puntos de almacenamiento" />
      <StateMsg loading={loading} error={error} />

      {!loading && !error && (
        <div className="cards-grid">
          {(data ?? []).length === 0
            ? <p className="state-msg">Sin bodegas registradas</p>
            : (data ?? []).map(b => (
                <InfoCard
                  key={b.id}
                  bg="#dbeafe" color="#1e40af" icon="🏪"
                  name={b.sucursal}
                  sub={`📍 ${b.direccion}`}
                />
              ))
          }
        </div>
      )}
    </div>
  );
}