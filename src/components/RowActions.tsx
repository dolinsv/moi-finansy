import { CopyIcon, EditIcon, TrashIcon } from './Icons'

interface RowActionsProps {
  onEdit: () => void
  onDelete: () => void
  onCopy?: () => void
}

export function RowActions({ onEdit, onDelete, onCopy }: RowActionsProps) {
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
      {onCopy ? (
        <button
          type="button"
          className="action-btn"
          onClick={onCopy}
          aria-label="Копировать"
          title="Копировать"
        >
          <CopyIcon />
        </button>
      ) : null}
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
