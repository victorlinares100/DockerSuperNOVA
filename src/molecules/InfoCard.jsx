import Avatar from "../atoms/Avatar";

export default function InfoCard({ bg, color, icon, name, sub, meta }) {
  return (
    <div className="info-card">
      <Avatar bg={bg} color={color}>{icon}</Avatar>
      <div style={{ flex: 1 }}>
        <div className="info-card-name">{name}</div>
        {sub  && <div className="info-card-sub" style={{ marginTop: 6 }}>{sub}</div>}
        {meta && <div className="info-card-meta">{meta}</div>}
      </div>
    </div>
  );
}