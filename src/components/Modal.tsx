import { useEffect, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './Icons'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  onSubmit?: (e: FormEvent) => void
  submitLabel?: string
}

export function Modal({
  title,
  open,
  onClose,
  children,
  onSubmit,
  submitLabel = 'Сохранить',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CloseIcon />
          </button>
        </div>
        {onSubmit ? (
          <form
            className="modal-body"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(e)
            }}
          >
            {children}
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn primary">
                {submitLabel}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-body">{children}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
