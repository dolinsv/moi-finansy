import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRightIcon, CloseIcon } from './Icons'

export type SelectOption = {
  value: string
  label: string
}

type SelectSheetProps = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function SelectSheet({
  label,
  value,
  options,
  onChange,
}: SelectSheetProps) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="field select-sheet-field">
      <span>{label}</span>
      <button
        type="button"
        className="select-sheet-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="select-sheet-trigger-text">
          {selected?.label ?? 'Выберите'}
        </span>
        <span className="select-sheet-chevron" aria-hidden>
          <ChevronRightIcon size={16} />
        </span>
      </button>

      {open
        ? createPortal(
            <div className="select-sheet-root" role="presentation">
              <button
                type="button"
                className="select-sheet-backdrop"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
              />
              <div
                className="select-sheet-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <div className="select-sheet-head">
                  <div className="select-sheet-handle" aria-hidden />
                  <div className="select-sheet-title-row">
                    <h2 id={titleId}>{label}</h2>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setOpen(false)}
                      aria-label="Закрыть"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
                <ul className="select-sheet-list" role="listbox">
                  {options.map((option) => {
                    const active = option.value === value
                    return (
                      <li key={option.value || '__all'}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={
                            active
                              ? 'select-sheet-option active'
                              : 'select-sheet-option'
                          }
                          onClick={() => {
                            onChange(option.value)
                            setOpen(false)
                          }}
                        >
                          <span>{option.label}</span>
                          {active ? <span className="select-sheet-check">✓</span> : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
