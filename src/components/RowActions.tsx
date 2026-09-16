import { EditIcon, TrashIcon } from './Icons'

interface RowActionsProps {
  onEdit: () => void
  onDelete: () => void
}

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="row-actions">
      <button
        type="button"
        className="action-btn"
        onClick={onEdit}
        aria-label="Изменить"
        title="Изменить"
      >
        <EditIcon />
      </button>
      <button
        type="button"
        className="action-btn danger"
        onClick={onDelete}
        aria-label="Удалить"
        title="Удалить"
      >
        <TrashIcon />
      </button>
    </div>
  )
}
