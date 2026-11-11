'use client'

import { useEffect, useId, useRef } from 'react'
import { ChevronLeft, Loader2, ShieldPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EstadoSolicitud } from '@/lib/cmq/types'

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const box = size === 'lg' ? 'size-14 rounded-2xl' : size === 'sm' ? 'size-8 rounded-lg' : 'size-10 rounded-xl'
  const icon = size === 'lg' ? 'size-8' : size === 'sm' ? 'size-4' : 'size-5'
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex items-center justify-center bg-primary text-primary-foreground', box)}>
        <ShieldPlus className={icon} aria-hidden="true" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={cn('font-semibold tracking-tight', size === 'lg' ? 'text-2xl' : 'text-base')}>
          CMQ <span className="text-primary">Salud</span>
        </span>
        {size !== 'sm' && (
          <span className="text-xs text-muted-foreground">Corporación Municipal de Quilpué</span>
        )}
      </div>
    </div>
  )
}

const chipStyles: Record<EstadoSolicitud, string> = {
  PENDIENTE_REVISION: 'bg-warning-soft text-warning-foreground ring-warning',
  APROBADO: 'bg-success-soft text-primary ring-primary/40',
  RECHAZADO: 'bg-destructive-soft text-destructive-foreground ring-destructive/40',
}

const chipLabels: Record<EstadoSolicitud, string> = {
  PENDIENTE_REVISION: 'PENDIENTE',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
}

export function StatusChip({ estado, className }: { estado: EstadoSolicitud; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset',
        chipStyles[estado],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {chipLabels[estado]}
    </span>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden="true" />
}

export const inputClass =
  'h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:opacity-60'

export const textareaClass =
  'min-h-20 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none aria-invalid:border-destructive'

export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive">
      {children}
    </p>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  dismissible?: boolean
}) {
  const titleId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, dismissible])

  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-foreground/50 animate-in fade-in-0 sm:items-center sm:p-4">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="flex max-h-[88%] w-full flex-col rounded-t-3xl bg-card shadow-2xl outline-none animate-in slide-in-from-bottom-6 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b px-5 pt-5 pb-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-base font-semibold text-balance">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Cerrar</span>
            </button>
          )}
        </div>
        <div className="cmq-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-col gap-2 border-t px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl border bg-card p-4 shadow-xs', className)}>{children}</div>
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
          <span className="sr-only">Volver</span>
        </button>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
