'use client'

import { ChevronDown, CloudUpload, GraduationCap, Inbox, RotateCcw, XCircle } from 'lucide-react'
import { useCmq } from '../store'
import { ScreenHeader, StatusChip } from '../ui'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/cmq/validation'

const FILTROS = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PENDIENTE_REVISION', label: 'Pendiente' },
  { id: 'APROBADO', label: 'Aprobado' },
  { id: 'RECHAZADO', label: 'Rechazado' },
] as const

export function RequestsScreen() {
  const {
    solicitudes,
    funcionario,
    requestFilter,
    setRequestFilter,
    expandedRequestId,
    setExpandedRequestId,
    correctRequest,
    goTo,
  } = useCmq()

  const propias = solicitudes.filter((s) => s.rutFuncionario === funcionario.rut)
  const visibles = requestFilter === 'TODOS' ? propias : propias.filter((s) => s.estado === requestFilter)
  const horasCapacitacion = propias
    .filter((s) => s.estado === 'APROBADO')
    .reduce((acc, s) => acc + (s.horasCapacitacion ?? 0), 0)

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Mis Solicitudes" subtitle="Historial de cargas y trámites" onBack={() => goTo('SCR-02')} />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-secondary p-3 text-secondary-foreground">
          <GraduationCap className="size-6 shrink-0" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-xs">Puntaje por capacitaciones acumulado</span>
            <span className="text-lg font-semibold tabular-nums">{horasCapacitacion} hrs</span>
          </div>
        </div>

        <div role="tablist" aria-label="Filtrar por estado" className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS.map((f) => {
            const count = f.id === 'TODOS' ? propias.length : propias.filter((s) => s.estado === f.id).length
            const active = requestFilter === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRequestFilter(f.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted',
                )}
              >
                {f.label}
                <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', active ? 'bg-primary-foreground/20' : 'bg-muted')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {visibles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <Inbox className="size-6" aria-hidden="true" />
            <p className="text-sm">No hay solicitudes con este estado.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibles.map((s) => {
              const open = expandedRequestId === s.id
              return (
                <li key={s.id} className="overflow-hidden rounded-xl border bg-card">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`detalle-${s.id}`}
                    onClick={() => setExpandedRequestId(open ? null : s.id)}
                    className="flex w-full items-start gap-3 p-3 text-left"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <StatusChip estado={s.estado} />
                        {s.syncPendiente && (
                          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <CloudUpload className="size-3" aria-hidden="true" /> Sync pendiente
                          </span>
                        )}
                      </div>
                      <span className="truncate text-sm font-medium">{s.titulo}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {s.folio} · {formatDate(s.fecha)}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn('mt-1 size-4 shrink-0 text-muted-foreground transition', open && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                  {open && (
                    <div id={`detalle-${s.id}`} className="flex flex-col gap-3 border-t bg-muted/50 p-3 text-xs">
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <div className="flex flex-col">
                          <dt className="text-muted-foreground">Tipo documental</dt>
                          <dd className="font-medium">{s.tipoDocumento ?? (s.campo ? `Dato oficial: ${s.campo}` : '—')}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-muted-foreground">Revisión</dt>
                          <dd className="font-medium">{s.ambito === 'RRHH' ? 'Recursos Humanos' : 'Jefatura directa'}</dd>
                        </div>
                        {s.revisor && (
                          <div className="col-span-2 flex flex-col">
                            <dt className="text-muted-foreground">Revisado por</dt>
                            <dd className="font-medium">
                              {s.revisor} · {s.fechaRevision && formatDate(s.fechaRevision)}
                            </dd>
                          </div>
                        )}
                        {s.observacion && (
                          <div className="col-span-2 flex flex-col">
                            <dt className="text-muted-foreground">Observación</dt>
                            <dd>{s.observacion}</dd>
                          </div>
                        )}
                        {s.valorNuevo && s.tipo === 'DATO_OFICIAL' && (
                          <div className="col-span-2 flex flex-col">
                            <dt className="text-muted-foreground">Cambio solicitado</dt>
                            <dd>
                              <span className="line-through opacity-60">{s.valorAnterior}</span> → {s.valorNuevo}
                            </dd>
                          </div>
                        )}
                      </dl>
                      <div className="flex items-center gap-2 rounded-lg bg-card p-2.5">
                        <GraduationCap className="size-4 text-primary" aria-hidden="true" />
                        <span>
                          Puntaje por capacitaciones acumulado:{' '}
                          <strong className="font-semibold">{horasCapacitacion} hrs</strong>
                          {s.horasCapacitacion ? ` (este certificado aporta ${s.horasCapacitacion} hrs)` : ''}
                        </span>
                      </div>
                      {s.estado === 'RECHAZADO' && (
                        <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive-soft p-3 text-destructive-foreground">
                          <p className="flex items-center gap-1.5 font-semibold">
                            <XCircle className="size-4" aria-hidden="true" /> Motivo del rechazo
                          </p>
                          <p className="leading-relaxed">{s.motivoRechazo}</p>
                          {s.tipo !== 'DATO_OFICIAL' && (
                            <button
                              type="button"
                              onClick={() => correctRequest(s.id)}
                              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive text-xs font-semibold text-primary-foreground"
                            >
                              <RotateCcw className="size-3.5" aria-hidden="true" /> Corregir y reinsertar
                            </button>
                          )}
                          {s.tipo === 'DATO_OFICIAL' && (
                            <button
                              type="button"
                              onClick={() => goTo('SCR-07')}
                              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive text-xs font-semibold text-primary-foreground"
                            >
                              <RotateCcw className="size-3.5" aria-hidden="true" /> Corregir y reinsertar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
