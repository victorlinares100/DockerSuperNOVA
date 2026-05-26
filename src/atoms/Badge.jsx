export default function Badge({ tipo }) {
  const map = {
    PENDIENTE:   ["badge badge-warn",   "Pendiente"],
    RECIBIDO:    ["badge badge-ok",     "Recibido"],
    "EN CAMINO": ["badge badge-info",   "En camino"],
    CANCELADO:   ["badge badge-danger", "Cancelado"],
    ACTIVO:      ["badge badge-ok",     "Activo"],
    INACTIVO:    ["badge badge-danger", "Inactivo"],
  };
  const [cls, label] = map[tipo?.toUpperCase()] ?? ["badge badge-info", tipo ?? "—"];
  return <span className={cls}>{label}</span>;
}