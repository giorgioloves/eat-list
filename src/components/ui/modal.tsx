'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  border:     '#c4b8a8',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  const maxWidth = size === 'sm' ? 380 : size === 'lg' ? 640 : 480

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(59,47,39,0.5)' }}
        onClick={onClose}
      />
      <div style={{
        position:        'relative',
        backgroundColor: T.parchment,
        border:          `0.5px solid ${T.border}`,
        borderRadius:    10,
        width:           '100%',
        maxWidth,
      }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `0.5px solid ${T.border}` }}>
            <h2 style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 18, fontWeight: 400, color: T.espresso, margin: 0 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, border: `0.5px solid ${T.border}`, backgroundColor: T.linen, cursor: 'pointer', color: T.mist }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>
        )}
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message, confirmLabel = 'confirm', danger, loading,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.mist, letterSpacing: '0.04em', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding:         '7px 14px',
              fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 10,
              color:           T.mist,
              backgroundColor: T.linen,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    7,
              cursor:          'pointer',
              letterSpacing:   '0.06em',
            }}
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding:         '7px 14px',
              fontFamily:      danger ? 'var(--font-dm-mono), ui-monospace, monospace' : 'var(--font-crimson), Georgia, serif',
              fontStyle:       danger ? 'normal' : 'italic',
              fontSize:        danger ? 8 : 13,
              color:           danger ? '#c47a7a' : T.parchment,
              backgroundColor: danger ? 'transparent' : T.espresso,
              border:          danger ? '0.5px solid #c47a7a' : 'none',
              borderRadius:    7,
              cursor:          loading ? 'not-allowed' : 'pointer',
              opacity:         loading ? 0.6 : 1,
              letterSpacing:   danger ? '0.06em' : undefined,
            }}
          >
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
