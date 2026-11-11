'use client'

import { Bell, Camera, ChevronRight, CalendarDays, Clock, FileText, LifeBuoy, Paperclip, Plane } from 'lucide-react'
import { useCmq } from '../store'
import { Card, Logo } from '../ui'
import { formatDate } from '@/lib/cmq/validation'

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4" aria-busy="true" aria-label="Cargando información">
      <div className="cmq-skeleton h-20 rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        <div className="cmq-skeleton h-24 rounded-xl" />
        <div className="cmq-skeleton h-24 rounded-xl" />
        <div className="cmq-skeleton h-24 rounded-xl" />
      </div>
      <div className="cmq-skeleton h-36 rounded-2xl" />
      <div className="cmq-skeleton h-16 rounded-xl" />
      <div className="cmq-skeleton h-16 rounded-xl" />
    </div>
  )
}

export function DashboardScreen() {
  const {
    funcionario,
    dashboardLoading,
    docCount,
    solicitudes,
    diasAdmin,
    documentos,
    goTo,
    resetDraft,
    openViewer,
    setHelpOpen,
    notifications,
    setNotifOpen,
  } = useCmq()

  const pendientes = solicitudes.filter(
    (s) => s.rutFuncionario === funcionario.rut && s.estado === 'PENDIENTE_REVISION',
  ).length
  const unread = notifications.filter((n) => !n.leida).length
  const initials = `${funcionario.nombres[0]}${funcionario.apellidos[0]}`

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <LifeBuoy className="size-5" aria-hidden="true" />
            <span className="sr-only">Ayuda y soporte</span>
          </button>
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <Bell className="size-5" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
            <span className="sr-only">Notificaciones ({unread} sin leer)</span>
          </button>
        </div>
      </header>

      {dashboardLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in-0">
          <Card className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-base font-semibold text-secondary-foreground">
              {initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="text-xs text-muted-foreground">Hola,</p>
              <p className="truncate text-base font-semibold">
                {funcionario.nombres} {funcionario.apellidos.split(' ')[0]} - {funcionario.centro}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {funcionario.cargo} · <span className="font-mono">{funcionario.rut}</span>
              </p>
            </div>
          </Card>

          <section aria-label="Resumen" className="grid grid-cols-3 gap-3">
            <Card className="flex flex-col gap-1 p-3">
              <FileText className="size-4 text-primary" aria-hidden="true" />
              <span className="text-2xl font-semibold tabular-nums">{docCount}</span>
              <span className="text-[11px] leading-tight text-muted-foreground">Documentos cargados</span>
            </Card>
            <button type="button" onClick={() => goTo('SCR-06')} className="text-left">
              <Card className="flex h-full flex-col gap-1 p-3 hover:border-warning">
                <Clock className="size-4 text-warning-foreground" aria-hidden="true" />
                <span className="text-2xl font-semibold tabular-nums">{pendientes}</span>
                <span className="text-[11px] leading-tight text-muted-foreground">Solicitudes pendientes</span>
              </Card>
            </button>
            <Card className="flex flex-col gap-1 p-3">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
              <span className="text-2xl font-semibold tabular-nums">
                {diasAdmin.disponibles}
                <span className="text-sm font-normal text-muted-foreground">/{diasAdmin.total}</span>
              </span>
              <span className="text-[11px] leading-tight text-muted-foreground">Días administrativos</span>
            </Card>
          </section>

          <button
            type="button"
            onClick={() => {
              resetDraft()
              goTo('SCR-03')
            }}
            className="group flex flex-col items-center gap-3 rounded-2xl bg-primary px-5 py-6 text-center text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <span className="flex items-center gap-2">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary-foreground/15 ring-4 ring-primary-foreground/20 transition group-hover:scale-105">
                <Camera className="size-7" aria-hidden="true" />
              </span>
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/15">
                <Paperclip className="size-5" aria-hidden="true" />
              </span>
            </span>
            <span className="text-base font-semibold text-balance">Toca aquí para fotografiar o adjuntar documento</span>
            <span className="text-xs opacity-85">Contratos, licencias, certificados y permisos</span>
          </button>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Balance de días</h2>
              <span className="text-[11px] text-muted-foreground">Periodo 2026</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-primary" aria-hidden="true" /> Administrativos
                </span>
                <span className="font-medium tabular-nums">
                  {diasAdmin.disponibles} disponibles · {diasAdmin.total - diasAdmin.disponibles} usados
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={diasAdmin.total}
                aria-valuenow={diasAdmin.disponibles}
                aria-label="Días administrativos disponibles"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${(diasAdmin.disponibles / diasAdmin.total) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Plane className="size-3.5 text-primary" aria-hidden="true" /> Vacaciones (feriado legal)
                </span>
                <span className="font-medium tabular-nums">11 disponibles · 4 usados</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div className="h-full w-[73%] rounded-full bg-primary/60" />
              </div>
            </div>
          </Card>

          <section className="flex flex-col gap-2" aria-labelledby="docs-recientes">
            <div className="flex items-center justify-between">
              <h2 id="docs-recientes" className="text-sm font-semibold">
                Documentos recientes
              </h2>
              <button type="button" onClick={() => goTo('SCR-06')} className="text-xs font-medium text-primary">
                Ver historial
              </button>
            </div>
            {documentos.slice(0, 3).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => openViewer(d.id)}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left hover:border-primary/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{d.titulo}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.tipo} · {formatDate(d.fecha)} · {d.tamano}
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </section>
        </div>
      )}
    </div>
  )
}
