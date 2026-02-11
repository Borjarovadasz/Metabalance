export default function WaterProgress({ progress, target, totalToday }) {
  return (
    <div className="water-box">
      <div className="water-label mb-2">Napi haladás</div>
      <div className="water-subtext">
        Tekintse meg, hogyan teljesít a napi céljához képest.
      </div>
      <div className="water-progress-wrapper">
        <div className="water-progress-circle">
          <div
            className="water-progress-inner"
            style={{ background: `conic-gradient(#ef6b6b ${progress}%, #f2f2f2 0)` }}
          >
            <div className="water-progress-center">
              <div className="water-progress-number">{progress}%</div>
              <div className="water-progress-text">Cél: {target ? `${target} ml` : "-"}</div>
              <div className="water-progress-text">
                Hátralévő: {target ? `${Math.max(target - totalToday, 0)} ml` : "-"}
              </div>
            </div>
          </div>
        </div>
        <div className="water-progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
        <div className="water-helper">Majdnem elérted a célodat! Folytasd!</div>
      </div>
    </div>
  );
}
