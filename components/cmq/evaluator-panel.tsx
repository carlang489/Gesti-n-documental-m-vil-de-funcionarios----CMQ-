'use client'

import { useState } from 'react'
import { Activity, CheckCircle2, CloudUpload, Gauge, ListChecks, MonitorSmartphone, Play, RefreshCw, ScrollText, Timer, Unlock, Wifi, WifiOff } from 'lucide-react'
import { useCmq } from './store'
import { Logo } from './ui'
import { cn } from '@/lib/utils'
import { PANTALLAS } from '@/lib/cmq/data'
import { CASOS_PRUEBA, REQ_PANTALLAS, type TestActionId } from '@/lib/cmq/requirements'

type Tab = 'pantallas' | 'pruebas' | 'auditoria' | 'sync'

const TABS: { id: Tab; label: string; icon: typeof ListChecks }[] = [
  { id: 'pantallas', label: 'Pantallas', icon: MonitorSmartphone },
  { id: 'pruebas', label: 'RF / RNF', icon: ListChecks },
  { id: 'auditoria', label: 'Auditoría', icon: ScrollText },
  { id: 'sync', label: 'Sync Queue', icon: CloudUpload },
]

function formatClock(ms: number) {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function EvaluatorPanel() {
  const store = useCmq()
  const {
    screen,
    navigateFromEvaluator,
    online,
    setOnline,
    audit,
    syncQueue,
    lastResponseMs,
    sessionRemainingMs,
    simulateInactivity,
    user,
    captureBlurry,
    setCaptureBlurry,
    resetLockout,
    loginState,
  } = store
  const [tab, setTab] = useState<Tab>('pantallas')

  const req = REQ_PANTALLAS.find((r) => r.id === screen)
  const meta = PANTALLAS.find((p) => p.id === screen)

  const runTest = (id: TestActionId) => {
    switch (id) {
      case 'TC-NEG-01':
        navigateFromEvaluator('SCR-01')
        resetLockout()
        store.pushToast('info', 'Ingresa 12.345.678-5 con una contraseña incorrecta 3 veces.')
        break
      case 'TC-NEG-02':
        navigateFromEvaluator('SCR-03')
        store.setOnboardingSeen(true)
        store.setUploadError('Formato o tamaño no permitido: "instalador_nomina.exe" (12.4 MB). Solo PDF, JPG o PNG hasta 10 MB.')
        break
      case 'TC-NEG-03':
        navigateFromEvaluator('SCR-07')
        store.setContactDraft({ telefono: "<script>alert('x')</script>", correo: "juan@cmq.cl' OR '1'='1" })
        store.pushToast('info', 'Presiona "Guardar Cambios" para verificar el bloqueo.')
        break
      case 'TC-NEG-04':
        store.resetDraft()
        store.setDraft({ tipo: 'Licencia Médica', archivo: 'Captura_camara.jpg', origen: 'camara' })
        navigateFromEvaluator('SCR-04')
        setOnline(false)
        break
      case 'TC-RNF-01':
        navigateFromEvaluator('SCR-02')
        break
      case 'TC-RNF-02':
        if (!user) navigateFromEvaluator('SCR-02')
        window.setTimeout(simulateInactivity, 50)
        break
      case 'BDD-01':
        navigateFromEvaluator('SCR-07')
        store.setContactDraft({ telefono: '+56 9 9123 4567', correo: store.funcionario.correo })
        break
      case 'BDD-02':
        navigateFromEvaluator('SCR-07')
        break
      case 'BDD-03':
        navigateFromEvaluator('SCR-08')
        store.setReviewerRole('RRHH')
        break
    }
  }

  return (
    <aside className="flex w-full flex-col gap-5 bg-sidebar p-5 text-sidebar-foreground md:h-dvh md:w-[420px] md:shrink-0 md:overflow-y-auto lg:w-[460px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 [&_span]:text-sidebar-foreground [&_.text-primary]:text-sidebar-primary [&_.text-muted-foreground]:text-sidebar-foreground/60">
          <Logo />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-balance">Prototipo MVP · Expedientes Laborales</h1>
          <p className="text-xs leading-relaxed text-sidebar-foreground/70">
            Especificación Técnica V5 · App Android nativa (simulada) · 8 pantallas SCR-01 a SCR-08 con dataset sintético.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setOnline(!online)}
          className={cn(
            'flex items-center gap-2 rounded-xl p-3 text-left text-xs font-medium ring-1 ring-sidebar-border transition',
            online ? 'bg-sidebar-accent' : 'bg-warning text-warning-foreground ring-warning',
          )}
          aria-pressed={!online}
        >
          {online ? <Wifi className="size-4" aria-hidden="true" /> : <WifiOff className="size-4" aria-hidden="true" />}
          <span className="flex flex-col">
            <span className="text-[10px] opacity-70">Conectividad</span>
            {online ? 'En línea' : 'Sin conexión'}
          </span>
        </button>
        <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent p-3 text-xs ring-1 ring-sidebar-border">
          <Timer className="size-4" aria-hidden="true" />
          <span className="flex flex-col">
            <span className="text-[10px] opacity-70">Sesión expira en</span>
            <span className="font-mono font-medium tabular-nums">
              {sessionRemainingMs !== null ? formatClock(sessionRemainingMs) : 'Sin sesión'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent p-3 text-xs ring-1 ring-sidebar-border">
          <Gauge className="size-4" aria-hidden="true" />
          <span className="flex flex-col">
            <span className="text-[10px] opacity-70">Última carga (TC-RNF-01)</span>
            <span className="font-mono font-medium tabular-nums">
              {lastResponseMs !== null ? `${lastResponseMs} ms · ${lastResponseMs < 3000 ? 'OK < 3 s' : 'Lento'}` : '—'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent p-3 text-xs ring-1 ring-sidebar-border">
          <Activity className="size-4" aria-hidden="true" />
          <span className="flex min-w-0 flex-col">
            <span className="text-[10px] opacity-70">Usuario activo</span>
            <span className="truncate font-medium">{user ? `${user.nombres} · ${user.perfil}` : 'Ninguno'}</span>
          </span>
        </div>
      </div>

      <div role="tablist" aria-label="Panel del evaluador" className="grid grid-cols-4 gap-1 rounded-xl bg-sidebar-accent p-1">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition',
                tab === t.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'pantallas' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            {PANTALLAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigateFromEvaluator(p.id)}
                aria-current={screen === p.id ? 'page' : undefined}
                className={cn(
                  'flex flex-col gap-0.5 rounded-xl p-3 text-left ring-1 transition',
                  screen === p.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground ring-sidebar-primary'
                    : 'bg-sidebar-accent ring-sidebar-border hover:ring-sidebar-primary',
                )}
              >
                <span className="font-mono text-[10px] opacity-80">{p.id}</span>
                <span className="text-xs leading-snug font-medium">{p.nombre}</span>
              </button>
            ))}
          </div>

          {req && meta && (
            <div className="flex flex-col gap-3 rounded-xl bg-sidebar-accent p-4 ring-1 ring-sidebar-border">
              <p className="text-sm font-semibold">
                <span className="font-mono text-sidebar-primary">{meta.id}</span> · {meta.nombre}
              </p>
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold tracking-wide text-sidebar-foreground/60 uppercase">Componentes UI obligatorios</p>
                <ul className="flex flex-col gap-1">
                  {req.componentes.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs leading-relaxed">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-sidebar-primary" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold tracking-wide text-sidebar-foreground/60 uppercase">Estados de carga, red y error</p>
                <ul className="flex flex-col gap-1">
                  {req.estados.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs leading-relaxed">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {screen === 'SCR-02' && (
                  <StateButton onClick={() => store.startDashboardLoad()} icon={RefreshCw} label="Ver skeleton" />
                )}
                {(screen === 'SCR-02' || screen === 'SCR-05') && (
                  <StateButton onClick={() => setOnline(!online)} icon={WifiOff} label={online ? 'Simular sin red' : 'Restaurar red'} />
                )}
                {screen === 'SCR-03' && (
                  <>
                    <StateButton onClick={() => store.setOnboardingSeen(false)} icon={Play} label="Mostrar tooltip" />
                    <StateButton onClick={() => runTest('TC-NEG-02')} icon={Play} label="Archivo > 10 MB" />
                  </>
                )}
                {screen === 'SCR-04' && (
                  <StateButton onClick={() => setCaptureBlurry(!captureBlurry)} icon={Play} label={captureBlurry ? 'Imagen nítida' : 'Imagen borrosa'} />
                )}
                {screen === 'SCR-05' && <StateButton onClick={() => store.retryViewer()} icon={RefreshCw} label="Recargar visor" />}
                {screen === 'SCR-01' && loginState.lockedUntil && (
                  <StateButton onClick={resetLockout} icon={Unlock} label="Desbloquear cuenta" />
                )}
                {screen === 'SCR-07' && <StateButton onClick={() => runTest('TC-NEG-03')} icon={Play} label="Inyectar código" />}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'pruebas' && (
        <div className="flex flex-col gap-2">
          {CASOS_PRUEBA.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-xl bg-sidebar-accent p-3 ring-1 ring-sidebar-border">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-sidebar-primary">{c.id}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      c.tipo === 'Funcional' ? 'bg-sidebar-primary/20 text-sidebar-foreground' : 'bg-warning/25 text-sidebar-foreground',
                    )}
                  >
                    {c.tipo}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => runTest(c.id)}
                  className="flex items-center gap-1 rounded-lg bg-sidebar-primary px-2.5 py-1 text-[11px] font-semibold text-sidebar-primary-foreground"
                >
                  <Play className="size-3" aria-hidden="true" /> Probar
                </button>
              </div>
              <p className="text-xs font-medium">{c.categoria}</p>
              <dl className="flex flex-col gap-1 text-[11px] leading-relaxed text-sidebar-foreground/75">
                <div>
                  <dt className="inline font-semibold text-sidebar-foreground/90">Condición: </dt>
                  <dd className="inline">{c.condicion}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-sidebar-foreground/90">Esperado: </dt>
                  <dd className="inline">{c.esperado}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      {tab === 'auditoria' && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-sidebar-foreground/60">LOG_AUDITORIA · append-only · {audit.length} registros</p>
          {audit.length === 0 ? (
            <p className="rounded-xl bg-sidebar-accent p-4 text-center text-xs text-sidebar-foreground/60">
              Aún no hay eventos. Inicia sesión o realiza una acción.
            </p>
          ) : (
            <ol className="flex flex-col gap-1.5 font-mono text-[11px]">
              {audit.map((a) => (
                <li key={a.id} className="flex flex-col gap-0.5 rounded-lg bg-sidebar-accent p-2.5 ring-1 ring-sidebar-border">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sidebar-primary">{a.accion}</span>
                    <span className="text-sidebar-foreground/60">
                      {new Date(a.ts).toLocaleTimeString('es-CL')}
                    </span>
                  </span>
                  <span className="text-sidebar-foreground/90">{a.usuario}</span>
                  <span className="text-sidebar-foreground/60">{a.detalle}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {tab === 'sync' && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] leading-relaxed text-sidebar-foreground/60">
            Cola local cifrada (SQLCipher) procesada por WorkManager. Cada envío tiene UUID único para evitar duplicados.
          </p>
          {syncQueue.length === 0 ? (
            <p className="rounded-xl bg-sidebar-accent p-4 text-center text-xs text-sidebar-foreground/60">
              Cola vacía. Ejecuta TC-NEG-04 para probar el corte de red.
            </p>
          ) : (
            syncQueue.map((i) => (
              <div key={i.uuid} className="flex flex-col gap-1 rounded-lg bg-sidebar-accent p-2.5 font-mono text-[11px] ring-1 ring-sidebar-border">
                <span className="flex items-center justify-between">
                  <span className="font-semibold">{i.titulo}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      i.status === 'SINCRONIZADO' && 'bg-sidebar-primary text-sidebar-primary-foreground',
                      i.status === 'EN_COLA' && 'bg-warning text-warning-foreground',
                      i.status === 'SINCRONIZANDO' && 'bg-sidebar-foreground text-sidebar',
                    )}
                  >
                    {i.status}
                  </span>
                </span>
                <span className="text-sidebar-foreground/60">UUID {i.uuid}</span>
                <span className="text-sidebar-foreground/60">
                  {i.operacion} · intentos {i.intentos}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  )
}

function StateButton({ onClick, icon: Icon, label }: { onClick: () => void; icon: typeof Play; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg bg-sidebar px-2.5 py-1.5 text-[11px] font-medium ring-1 ring-sidebar-border hover:ring-sidebar-primary"
    >
      <Icon className="size-3.5" aria-hidden="true" /> {label}
    </button>
  )
}
