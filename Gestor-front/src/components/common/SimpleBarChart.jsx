import './SimpleBarChart.css';

/**
 * Gráfica de barras agrupadas, hecha sin dependencias externas (CSS +
 * flexbox) para no agregar `recharts` como dependencia. Pensada para
 * series cortas (6-12 categorías) como la de cotizadas/aceptadas por mes.
 *
 * @param {{
 *   data: Array<Record<string, any>>,
 *   categoryKey: string,
 *   series: Array<{ key: string, label: string, color: string }>,
 * }} props
 */
export default function SimpleBarChart({ data, categoryKey, series }) {
  const maxValue = Math.max(1, ...data.flatMap((row) => series.map((s) => Number(row[s.key]) || 0)));

  return (
    <div className="simple-chart">
      <div className="simple-chart-legend">
        {series.map((s) => (
          <div key={s.key} className="simple-chart-legend-item">
            <span className="simple-chart-swatch" style={{ background: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="simple-chart-bars">
        {data.map((row) => (
          <div key={row[categoryKey]} className="simple-chart-group">
            <div className="simple-chart-columns">
              {series.map((s) => {
                const value = Number(row[s.key]) || 0;
                const heightPct = (value / maxValue) * 100;
                return (
                  <div key={s.key} className="simple-chart-column" title={`${s.label}: ${value}`}>
                    <span className="simple-chart-value">{value}</span>
                    <div
                      className="simple-chart-bar"
                      style={{ height: `${heightPct}%`, background: s.color }}
                    />
                  </div>
                );
              })}
            </div>
            <span className="simple-chart-category">{row[categoryKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
