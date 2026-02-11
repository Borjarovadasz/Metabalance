export default function MoodChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="mood-chart-placeholder">Nincs adat.</div>;
  }

  const width = 640;
  const height = 220;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const values = data.map((d) => Number(d.value || 0));
  const labels = data.map((d) => String(d.label || ""));
  const minV = 0;
  const maxV = Math.max(...values, 1);
  const range = maxV - minV || 1;

  const points = values.map((v, i) => {
    const x = padLeft + (innerW * i) / Math.max(1, values.length - 1);
    const y = padTop + innerH - ((v - minV) / range) * innerH;
    return { x, y };
  });

  const pointStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="mood-chart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220">
        <rect x="0" y="0" width={width} height={height} fill="#fff" />
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={height - padBottom} stroke="#eee" />
        <line x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} stroke="#eee" />
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padTop + (innerH * i) / 4;
          const v = Math.round(maxV - (range * i) / 4);
          return (
            <g key={i}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#f2f2f2" />
              <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#777">
                {v}
              </text>
            </g>
          );
        })}
        <polyline points={pointStr} fill="none" stroke="#ef6b6b" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#ef6b6b" />
        ))}
        {labels.map((label, i) => (
          <text
            key={label + i}
            x={points[i].x}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#777"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
