import type { ReactNode } from 'react'

export type SortDir = 'asc' | 'desc'

export type SortState<K extends string> = {
  key: K
  dir: SortDir
}

type SortableThProps<K extends string> = {
  label: string
  column: K
  sort: SortState<K>
  onSort: (key: K) => void
  className?: string
  children?: ReactNode
}

export function SortableTh<K extends string>({
  label,
  column,
  sort,
  onSort,
  className = '',
}: SortableThProps<K>) {
  const active = sort.key === column
  return (
    <th className={className} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className={`sort-th${active ? ' active' : ''}`}
        onClick={() => onSort(column)}
      >
        <span>{label}</span>
        <span className="sort-mark" aria-hidden>
          {active ? (sort.dir === 'asc' ? '▲' : '▼') : '◇'}
        </span>
      </button>
    </th>
  )
}

export function toggleSort<K extends string>(
  prev: SortState<K>,
  key: K,
): SortState<K> {
  if (prev.key === key) {
    return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
  }
  const defaultDesc = key === 'date' || key === 'amount'
  return { key, dir: defaultDesc ? 'desc' : 'asc' }
}

export function compareValues(
  a: string | number,
  b: string | number,
  dir: SortDir,
): number {
  const result =
    typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), 'ru', { sensitivity: 'base' })
  return dir === 'asc' ? result : -result
}
