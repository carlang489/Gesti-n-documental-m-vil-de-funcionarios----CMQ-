'use client'

import { useState } from 'react'
import { ArrowDown, Building2, Check, ChevronRight, FileText, Inbox, LogOut, UserRound, X } from 'lucide-react'
import { useCmq } from '../store'
import { FieldError, Logo, Modal, StatusChip, textareaClass } from '../ui'
import { cn } from '@/lib/utils'
import { formatDate, hasInjection } from '@/lib/cmq/validation'

export function ApprovalsScreen() {
  const { solicitudes, reviewerRole, setReviewerRole, reviewTarget, setReviewTarget, approve, reject, user, logout } =
    useCmq()
  const [motivo, setMotivo] = useState('')
  const [motivoError, setMotivoError] = useState<string | null>(null)

  const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE_REVISION' && s.ambito === reviewerRole)
  const resueltas = solicitudes
    .filter((s) => s.estado !== 'PENDIENTE_REVISION' && s.ambito === reviewerRole && s.revisor)
    .slice(0, 4)
  const target = solicitudes.find((s) => s.id === reviewTarget?.id)
  const rejecting = reviewTarget?.mode === 'reject'

  const closeModal = () => {
    setReviewTarget(null)
    setMotivo('')
    setMotivoError(null)
  }

  const onReject = () => {
    if (!target) return
    if (!motivo.trim()) return setMotivoError('El motivo de rechazo es obligatorio.')
    if (hasInjection(motivo)) return setMotivoError('Se detectaron caracteres o código no permitido. Envío bloqueado.')
    reject(target.id, motivo)
    setMotivo('')
    setMotivoError(null)
  }

  return (
    <div className="relative flex flex-col">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive-soft"
        >
          <LogOut className="size-4" aria-hidden="true" /> Salir
        </button>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Panel de Aprobación</h1>
          <p className="text-xs text-muted-foreground">
            {user ? `${user.nombres} ${user.apellidos} · ${user.cargo}` : 'Revisor'}
          </p>
        </div>

        <div role="tablist" aria-label="Vista de rol" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(['RRHH', 'JEFATURA'] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={reviewerRole === r}
              onClick={() => setReviewerRole(r)}
              className={cn(
                'h-9 rounded-lg text-sm font-medium transition',
                reviewerRole === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {r === 'RRHH' ? 'Recursos Humanos' : 'Jefatura'}
            </button>
          ))}
        </div>

        <p className="rounded-lg bg-secondary px-3 py-2 text-[11px] leading-relaxed text-secondary-foreground">
          {reviewerRole === 'RRHH'
            ? 'Gestión completa de expedientes, licencias (acceso segmentado) y cambios de datos oficiales.'
            : 'Solo solicitudes y permisos de tu equipo directo en CESFAM Quilpué.'}
        </p>

        <section aria-labelledby="pendientes" className="flex flex-col gap-2">
          <h2 id="pendientes" className="flex items-center justify-between text-sm font-semibold">
            Pendientes de revisión
            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning-foreground tabular-nums">
              {pendientes.length}
            </span>
          </h2>
          {pendientes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              <Inbox className="size-6" aria-hidden="true" />
              <p className="text-sm">No hay solicitudes pendientes.</p>
            </div>
          ) : (
            pendientes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setReviewTarget({ id: s.id, mode: 'review' })}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left hover:border-primary/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{s.funcionario}</span>
                  <span className="truncate text-xs text-muted-foreground">{s.titulo}</span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Building2 className="size-3" aria-hidden="true" /> {s.centro} · {formatDate(s.fecha)}
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </button>
            ))
          )}
        </section>

        {resueltas.length > 0 && (
          <section aria-labelledby="resueltas" className="flex flex-col gap-2">
            <h2 id="resueltas" className="text-sm font-semibold">
              Resueltas recientemente
            </h2>
            {resueltas.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{s.funcionario}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{s.folio}</span>
                </span>
                <StatusChip estado={s.estado} />
              </div>
            ))}
          </section>
        )}
      </div>

      <Modal
        open={!!target}
        onClose={closeModal}
        title={target ? `Revisión ${target.folio}` : ''}
        description={target ? `${target.funcionario} · ${target.rutFuncionario} · ${target.centro}` : undefined}
        footer={
          target &&
          (rejecting ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="motivo" className="text-sm font-medium">
                  Motivo de rechazo <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="motivo"
                  value={motivo}
                  maxLength={300}
                  onChange={(e) => {
                    setMotivo(e.target.value)
                    setMotivoError(null)
                  }}
                  placeholder="Indica qué debe corregir el funcionario"
                  className={textareaClass}
                  aria-invalid={!!motivoError}
                  aria-required="true"
                />
                {motivoError ? (
                  <FieldError>{motivoError}</FieldError>
                ) : (
                  !motivo.trim() && (
                    <p className="text-[11px] text-muted-foreground">
                      El botón Rechazar se habilita al ingresar el motivo.
                    </p>
                  )
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewTarget({ id: target.id, mode: 'review' })}
                  className="h-11 flex-1 rounded-xl border text-sm font-medium hover:bg-muted"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={onReject}
                  disabled={!motivo.trim()}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-destructive text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="size-4" aria-hidden="true" /> Rechazar
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReviewTarget({ id: target.id, mode: 'reject' })}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-destructive/40 text-sm font-semibold text-destructive hover:bg-destructive-soft"
              >
                <X className="size-4" aria-hidden="true" /> Rechazar
              </button>
              <button
                type="button"
                onClick={() => approve(target.id)}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
              >
                <Check className="size-4" aria-hidden="true" /> Aprobar
              </button>
            </div>
          ))
        }
      >
        {target && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{target.titulo}</span>
              <StatusChip estado={target.estado} />
            </div>
            <div className="flex flex-col gap-1 rounded-xl border bg-muted p-3">
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Valor anterior (vigente)
              </span>
              <span className="font-medium">{target.valorAnterior ?? '—'}</span>
            </div>
            <ArrowDown className="size-4 self-center text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-1 rounded-xl border border-primary/40 bg-success-soft p-3">
              <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                Nuevo valor solicitado
              </span>
              <span className="font-medium">{target.valorNuevo ?? '—'}</span>
            </div>
            {target.observacion && (
              <p className="text-xs leading-relaxed text-muted-foreground">Observación: {target.observacion}</p>
            )}
            {target.adjunto && (
              <div className="flex items-center gap-2 rounded-xl border p-3 text-xs">
                <FileText className="size-4 text-primary" aria-hidden="true" />
                <span className="flex-1 truncate font-mono">{target.adjunto}</span>
                <span className="text-muted-foreground">Respaldo</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
