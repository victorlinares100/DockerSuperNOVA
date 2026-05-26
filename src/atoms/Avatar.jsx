export default function Avatar({ bg = "#dbeafe", color = "#1e40af", children }) {
  return (
    <div className="avatar" style={{ background: bg, color, fontSize: 20 }}>
      {children}
    </div>
  );
}