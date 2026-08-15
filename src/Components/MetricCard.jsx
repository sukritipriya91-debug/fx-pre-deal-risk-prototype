function MetricCard({ label, before, after }) {
  return (
    <div className="metric-card">
      <div className="metric-label">
        {label}
      </div>

      <div className="metric-values">
        <div>
          <span>AS-IS</span>
          <strong>{before}</strong>
        </div>

        <div className="arrow">
          →
        </div>

        <div>
          <span>TO-BE</span>
          <strong>{after}</strong>
        </div>
      </div>
    </div>
  );
}

export default MetricCard;