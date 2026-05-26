export default function EmptyRow({ cols, mensaje = "Sin datos registrados" }) {
  return (
    <tr>
      <td colSpan={cols} className="state-msg">{mensaje}</td>
    </tr>
  );
}
