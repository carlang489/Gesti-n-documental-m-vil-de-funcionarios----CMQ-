'use client'

import { BatteryFull, Bell, CheckCircle2, ClipboardList, Home, Info, Mail, Phone, Signal, TriangleAlert, Upload, UserRound, Wifi, WifiOff, XCircle } from 'lucide-react'
import { useCmq } from './store'
import { Modal } from './ui'
import { cn } from '@/lib/utils'
import { FAQ } from '@/lib/cmq/data'
import type { ScreenId } from '@/lib/cmq/types'
import { LoginScreen } from './screens/login-screen'
import { DashboardScreen } from './screens/dashboard-screen'
import { UploadScreen } from './screens/upload-screen'
import { CaptureScreen } from './screens/capture-screen'
import { ViewerScreen } from './screens/viewer-screen'
import { RequestsScreen } from './screens/requests-screen'
import { ProfileScreen } from './screens/profile-screen'
import { ApprovalsScreen } from './screens/approvals-screen'

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  'SCR-01': LoginScreen,
  'SCR-02': DashboardScreen,
  'SCR-03': UploadScreen,
  'SCR-04': CaptureScreen,
  'SCR-05': ViewerScreen,
  'SCR-06': RequestsScreen,
  'SCR-07': ProfileScreen,
  'SCR-08': ApprovalsScreen,
}

const TABS: { id: ScreenId; label: string; icon: typeof Home }[] = [
  { id: 'SCR-02', label: 'Inicio', icon: Home },
  { id: 'SCR-03', label: 'Cargar', icon: Upload },
  { id: 'SCR-06', label: 'Mis Solicitudes', icon: ClipboardList },
  { id: 'SCR-07', label: 'Perfil', icon: UserRound },
]

const TOAST_ICON = { success: CheckCircle2, error: XCircle, info: Info, warning: TriangleAlert }
const TOAST_STYLE = {
  success: 'bg-primary text-primary-foreground',
  error: 'bg-destructive text-primary-foreground',
  info: 'bg-foreground text-background',
  warning: 'bg-warning text-warning-foreground',
}

export function PhoneShell() {
  const {
    screen,
    goTo,
    user,
    online,
    syncQueue,
    toasts,
    dismissToast,
    phoneBanner,
    helpOpen,
    setHelpOpen,
    notifOpen,
    setNotifOpen,
    notifications,
    markNotificationsRead,
    resetDraft,
  } = useCmq()

  const Screen = SCREENS[screen]
  const showTabs = user?.perfil === 'Funcionario' && ['SCR-02', 'SCR-03', 'SCR-06', 'SCR-07'].includes(screen)
  const pendingSync = syncQueue.filter((i) => i.status !== 'SINCRONIZADO').length
  const showOffline = screen !== 'SCR-01' && (!online || pendingSync > 0)

  return (
    <div className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[min(840px,calc(100dvh-3rem))] sm:w-[390px] sm:rounded-[2.75rem] sm:border-[10px] sm:border-sidebar sm:shadow-2xl">
      <div className="flex h-9 shrink-0 items-center justify-between bg-card px-6 text-[11px] font-semibold" aria-hidden="true">
        <span className="tabular-nums">9:41</span>
        <span className="hidden h-5 w-24 rounded-full bg-sidebar sm:block" />
        <span className="flex items-center gap-1">
          <Signal className="size-3.5" />
          {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5 text-destructive" />}
          <BatteryFull className="size-4" />
        </span>
      </div>

      {showOffline && (
        <div
          role="status"
          className="flex shrink-0 items-center gap-2 bg-warning px-4 py-2 text-xs font-semibold text-warning-foreground"
        >
          <WifiOff className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">
            {online ? 'Sincronizando cambios pendientes…' : 'Modo sin conexión - Sincronización pendiente'}
          </span>
          {pendingSync > 0 && (
            <span className="rounded-full bg-warning-foreground/15 px-2 py-0.5 tabular-nums">{pendingSync}</span>
          )}
        </div>
      )}

      <main className="cmq-scroll relative flex-1 overflow-y-auto">
        <Screen key={screen} />
      </main>

      {showTabs && (
        <nav aria-label="Navegación principal" className="grid shrink-0 grid-cols-4 border-t bg-card pb-2">
          {TABS.map((t) => {
            const active = screen === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  if (t.id === 'SCR-03') resetDraft()
                  goTo(t.id)
                }}
                className={cn(
                  'flex flex-col items-center gap-1 pt-2.5 pb-1 text-[10px] font-medium',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span className={cn('flex h-7 w-12 items-center justify-center rounded-full', active && 'bg-secondary')}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {t.label}
              </button>
            )
          })}
        </nav>
      )}

      <div className="pointer-events-none absolute inset-x-3 top-11 z-50 flex flex-col gap-2" aria-live="polite">
        {phoneBanner && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-card/95 p-3 shadow-xl ring-1 ring-border backdrop-blur animate-in slide-in-from-top-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bell className="size-4" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">CMQ Salud · ahora</span>
              <span className="text-xs leading-relaxed text-muted-foreground">{phoneBanner.text}</span>
            </div>
          </div>
        )}
        {toasts.map((t) => {
          const Icon = TOAST_ICON[t.tone]
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => dismissToast(t.id)}
              className={cn(
                'pointer-events-auto flex items-start gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium shadow-lg animate-in slide-in-from-top-2 fade-in-0',
                TOAST_STYLE[t.tone],
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="leading-relaxed">{t.message}</span>
            </button>
          )
        })}
      </div>

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Ayuda y soporte"
        description="Preguntas frecuentes y contacto de la Mesa de Ayuda CMQ"
      >
        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-xl border bg-card p-3">
              <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
              <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
          <div className="flex flex-col gap-2 rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
            <p className="font-semibold">Mesa de Ayuda TI · Lun a Vie 08:00-17:30</p>
            <p className="flex items-center gap-2">
              <Phone className="size-3.5" aria-hidden="true" /> +56 32 292 4500
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-3.5" aria-hidden="true" /> soporte.salud@cmquilpue.cl
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={notifOpen}
        onClose={() => {
          markNotificationsRead()
          setNotifOpen(false)
        }}
        title="Notificaciones"
        description="Solo notificaciones locales con texto genérico, sin datos sensibles."
      >
        {notifications.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No tienes notificaciones.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markNotificationsRead()
                    setNotifOpen(false)
                    goTo('SCR-06')
                  }}
                  className="flex w-full items-start gap-2 rounded-xl border bg-card p-3 text-left text-xs"
                >
                  {!n.leida && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="Sin leer" />}
                  <span className="flex flex-col gap-0.5">
                    <span className="leading-relaxed">{n.text}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(n.ts).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
