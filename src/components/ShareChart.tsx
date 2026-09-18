import { formatMoney } from '../utils'

export type ChartTone = 'up' | 'down' | 'soft'

export type ChartItem = {
  id: string
  label: string
  value: number
}

type ShareChartProps = {
  items: ChartItem[]
  tone?: ChartTone
  emptyText?: string
}

export function ShareChart({
  items,
  tone = 'soft',
  emptyText = 'Нет данных для диаграммы',
}: ShareChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  if (items.length === 0 || total <= 0) {
    return <p className="chart-empty">{emptyText}</p>
  }

  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="share-chart" role="img" aria-label="Диаграмма долей">
      {items.map((item) => {
        const width = Math.max(4, Math.round((item.value / max) * 100))
        const share = Math.round((item.value / total) * 100)
        return (
          <div key={item.id} className="share-row">
            <div className="share-meta">
              <span className="share-label">{item.label}</span>
              <strong className={`share-value tone-${tone}`}>
                {formatMoney(item.value)}
                <span className="share-pct">{share}%</span>
              </strong>
            </div>
            <div className="share-track">
              <div
                className={`share-fill tone-${tone}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

type CompareChartProps = {
  left: { label: string; value: number }
  right: { label: string; value: number }
}

export function CompareChart({ left, right }: CompareChartProps) {
  const max = Math.max(left.value, right.value, 1)
  return (
    <div className="compare-chart" role="img" aria-label="Сравнение сумм">
      <div className="compare-row">
        <span>{left.label}</span>
        <strong className="tone-up">{formatMoney(left.value)}</strong>
        <div className="share-track">
          <div
            className="share-fill tone-up"
            style={{ width: `${Math.round((left.value / max) * 100)}%` }}
          />
        </div>
      </div>
      <div className="compare-row">
        <span>{right.label}</span>
        <strong className="tone-down">{formatMoney(right.value)}</strong>
        <div className="share-track">
          <div
            className="share-fill tone-down"
            style={{ width: `${Math.round((right.value / max) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

type ProgressChartProps = {
  label: string
  current: number
  total: number
  tone?: ChartTone
}

export function ProgressChart({
  label,
  current,
  total,
  tone = 'soft',
}: ProgressChartProps) {
  const pct =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div className="progress-chart">
      <div className="share-meta">
        <span className="share-label">{label}</span>
        <strong className={`share-value tone-${tone}`}>
          {formatMoney(current)}
          <span className="share-pct">из {formatMoney(total)}</span>
        </strong>
      </div>
      <div className="share-track">
        <div className={`share-fill tone-${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
