export default function StateMsg({ loading, error }) {
  if (loading) return <p className="state-msg">Cargando…</p>;
  if (error)   return <p className="state-msg state-error">Error: {error}</p>;
  return null;
}