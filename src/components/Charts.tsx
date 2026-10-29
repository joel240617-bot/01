import { money, percent, shortPeriod } from "../utils/calculations";
export const chartColors = [
  "#4ca5ff",
  "#123e73",
  "#1689f9",
  "#96b9dc",
  "#7e5bdf",
  "#ffbf35",
];
export function Donut({
  items,
  totalLabel = "Total mensal",
  currency = true,
  onSelect,
}: {
  items: { key: string; label: string; value: number }[];
  totalLabel?: string;
  currency?: boolean;
  onSelect?: (key: string) => void;
}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  let cumulative = 0;
  return (
    <div className="donut-layout">
      <div className="donut">
        <svg
          viewBox="0 0 180 180"
          role="img"
          aria-label={items
            .map((i) => `${i.label}: ${currency ? money(i.value) : i.value}`)
            .join("; ")}
        >
          <circle
            cx="90"
            cy="90"
            r="68"
            fill="none"
            stroke="#e9f1f9"
            strokeWidth="27"
          />
          {items.map((item, i) => {
            const start = cumulative;
            cumulative += total ? (item.value / total) * 100 : 0;
            return (
              <circle
                key={item.key}
                cx="90"
                cy="90"
                r="68"
                fill="none"
                stroke={chartColors[i % chartColors.length]}
                strokeWidth="27"
                pathLength="100"
                strokeDasharray={`${total ? (item.value / total) * 100 : 0} 100`}
                strokeDashoffset={-start}
                transform="rotate(-90 90 90)"
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <strong>{currency ? money(total) : total}</strong>
          <span>{totalLabel}</span>
        </div>
      </div>
      <div className="chart-legend">
        {items.map((item, i) => (
          <button
            disabled={!onSelect}
            onClick={() => onSelect?.(item.key)}
            key={item.key}
          >
            <i style={{ background: chartColors[i % chartColors.length] }} />
            <span>
              {item.label}
              <strong>
                {currency ? money(item.value) : `${item.value} unidades`}
              </strong>
            </span>
            <small>{percent(item.value, total)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
export function CostBars({
  items,
}: {
  items: { period: string; value: number }[];
}) {
  const max = Math.max(...items.map((x) => x.value), 1) * 1.2;
  return (
    <div
      className="bar-chart"
      role="img"
      aria-label={items
        .map((i) => `${shortPeriod(i.period)}: ${money(i.value)}`)
        .join("; ")}
    >
      <div className="bar-axis">
        {[1, 0.75, 0.5, 0.25, 0].map((f) => (
          <span key={f}>
            {new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(
              max * f,
            )}
          </span>
        ))}
      </div>
      <div className="bars">
        {items.map((item, i) => (
          <div className="bar-column" key={item.period}>
            <div
              className={`bar ${i === items.length - 1 ? "selected" : ""}`}
              style={{ height: `${(item.value / max) * 100}%` }}
            >
              <strong>{money(item.value).replace(",00", "")}</strong>
            </div>
            <span>{shortPeriod(item.period)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ShiftBars({
  items,
}: {
  items: { label: string; quantity: number; value: number }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1) * 1.3;
  const maxQ = Math.max(...items.map((i) => i.quantity), 1) * 1.3;
  return (
    <div className="shift-chart">
      <div className="small-legend">
        <span>● Quantidade de postos</span>
        <span>● Custo mensal (R$)</span>
      </div>
      <div className="shift-bars">
        {items.map((i) => (
          <div className="shift-group" key={i.label}>
            <div
              className="bar"
              style={{ height: `${(i.quantity / maxQ) * 100}%` }}
            >
              <strong>{i.quantity}</strong>
            </div>
            <div
              className="bar selected"
              style={{ height: `${(i.value / max) * 100}%` }}
            >
              <strong>{money(i.value)}</strong>
            </div>
            <span>{i.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
