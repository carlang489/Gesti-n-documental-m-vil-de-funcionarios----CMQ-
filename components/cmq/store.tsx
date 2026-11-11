'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { DOCUMENTOS_INICIALES, SOLICITUDES_INICIALES, SOLICITUDES_OTROS, USUARIOS } from '@/lib/cmq/data'
import type {
  AmbitoRevision,
  AuditEntry,
  ContactDraft,
  Documento,
  LocalNotification,
  ScreenId,
  Solicitud,
  SyncItem,
  Toast,
  ToastTone,
  UploadDraft,
  Usuario,
} from '@/lib/cmq/types'
import {
  LOCKOUT_MS,
  MAX_LOGIN_ATTEMPTS,
  SESSION_TIMEOUT_MS,
  cleanRut,
  escapeHtml,
  hasInjection,
  isValidEmail,
  isValidPhone,
  isValidRut,
  nowIso,
  uuid,
} from '@/lib/cmq/validation'

type ViewerStatus = 'loading' | 'ready' | 'error'
type RequestFilter = 'TODOS' | 'PENDIENTE_REVISION' | 'APROBADO' | 'RECHAZADO'
type SubmitResult = { status: 'sent' | 'queued' | 'duplicate'; folio?: string }

interface LoginState {
  loading: boolean
  error: string | null
  notice: string | null
  attempts: number
  lockedUntil: number | null
}

interface ReviewTarget {
  id: string
  mode: 'review' | 'reject'
}

function emptyDraft(): UploadDraft & { id: string } {
  return {
    id: `sol-${uuid().slice(0, 8)}`,
    tipo: '',
    fecha: new Date().toISOString().slice(0, 10),
    observacion: '',
  }
}

function useStoreValue() {
  const [screen, setScreen] = useState<ScreenId>('SCR-01')
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS)
  const [sessionUserId, setSessionUserId] = useState<number | null>(null)
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)
  const [loginState, setLoginState] = useState<LoginState>({
    loading: false,
    error: null,
    notice: null,
    attempts: 0,
    lockedUntil: null,
  })
  const [consentOpen, setConsentOpen] = useState(false)
  const [consentBlocked, setConsentBlocked] = useState(false)

  const [online, setOnlineState] = useState(true)
  const [documentos, setDocumentos] = useState<Documento[]>(DOCUMENTOS_INICIALES)
  const [docCount, setDocCount] = useState(12)
  const [diasAdmin, setDiasAdmin] = useState({ disponibles: 6, total: 10 })
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([...SOLICITUDES_INICIALES, ...SOLICITUDES_OTROS])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([])
  const [notifications, setNotifications] = useState<LocalNotification[]>([])
  const [phoneBanner, setPhoneBanner] = useState<LocalNotification | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [lastResponseMs, setLastResponseMs] = useState<number | null>(null)
  const [draft, setDraftState] = useState(emptyDraft)
  const [onboardingSeen, setOnboardingSeen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [captureBlurry, setCaptureBlurry] = useState(false)
  const [viewerDocId, setViewerDocId] = useState('doc-1')
  const [viewerStatus, setViewerStatus] = useState<ViewerStatus>('ready')
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('TODOS')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>('sol-2')
  const [contactDraft, setContactDraft] = useState<ContactDraft>({
    telefono: USUARIOS[0].telefono,
    correo: USUARIOS[0].correo,
  })
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactDraft, string>>>({})
  const [reviewerRole, setReviewerRole] = useState<AmbitoRevision>('RRHH')
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [tick, setTick] = useState(() => Date.now())

  const lastActivity = useRef(Date.now())
  const folioCounter = useRef(160)
  const syncQueueRef = useRef<SyncItem[]>([])
  syncQueueRef.current = syncQueue

  const user = usuarios.find((u) => u.id === sessionUserId) ?? null
  const funcionario = usuarios[0]

  const later = useCallback((fn: () => void, ms: number) => {
    window.setTimeout(fn, ms)
  }, [])

  const pushToast = useCallback(
    (tone: ToastTone, message: string) => {
      const id = uuid()
      setToasts((t) => [...t, { id, tone, message }])
      later(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
    },
    [later],
  )

  const dismissToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id))

  const addAudit = useCallback((usuario: string, accion: string, detalle: string) => {
    setAudit((a) => [{ id: uuid(), ts: nowIso(), usuario, accion, detalle }, ...a].slice(0, 60))
  }, [])

  const notifyLocal = useCallback(() => {
    const n: LocalNotification = {
      id: uuid(),
      ts: nowIso(),
      text: 'Tienes una actualización en tus solicitudes. Abre CMQ Salud para revisarla.',
      leida: false,
    }
    setNotifications((list) => [n, ...list])
    setPhoneBanner(n)
    later(() => setPhoneBanner((b) => (b?.id === n.id ? null : b)), 4200)
  }, [later])

  const startDashboardLoad = useCallback(() => {
    const started = performance.now()
    setDashboardLoading(true)
    later(() => {
      setDashboardLoading(false)
      setLastResponseMs(Math.round(performance.now() - started))
    }, 650 + Math.round(Math.random() * 650))
  }, [later])

  const startViewerLoad = useCallback(
    (isOnline: boolean) => {
      setViewerStatus('loading')
      later(() => setViewerStatus(isOnline ? 'ready' : 'error'), 900)
    },
    [later],
  )

  const goTo = useCallback(
    (target: ScreenId) => {
      setScreen(target)
      if (target === 'SCR-02') startDashboardLoad()
      if (target === 'SCR-05') startViewerLoad(online)
      if (target === 'SCR-04') setCaptureBlurry(false)
    },
    [online, startDashboardLoad, startViewerLoad],
  )

  const startSession = useCallback(
    (id: number) => {
      setSessionUserId(id)
      lastActivity.current = Date.now()
      const u = USUARIOS.find((x) => x.id === id)
      if (u?.perfil === 'Jefatura') setReviewerRole('JEFATURA')
      if (u?.perfil === 'Recursos Humanos') setReviewerRole('RRHH')
    },
    [],
  )

  const logout = useCallback(
    (notice?: string) => {
      if (user) addAudit(`${user.nombres} ${user.apellidos}`, 'LOGOUT', notice ?? 'Cierre de sesión manual')
      setSessionUserId(null)
      setPendingUserId(null)
      setReviewTarget(null)
      setHelpOpen(false)
      setNotifOpen(false)
      setScreen('SCR-01')
      setLoginState((s) => ({ ...s, loading: false, error: null, notice: notice ?? null }))
    },
    [addAudit, user],
  )

  const navigateFromEvaluator = (target: ScreenId) => {
    if (target === 'SCR-01') {
      if (sessionUserId) logout()
      else setScreen('SCR-01')
      return
    }
    const needsReviewer = target === 'SCR-08'
    const current = usuarios.find((u) => u.id === sessionUserId)
    if (needsReviewer && (!current || current.perfil === 'Funcionario')) {
      startSession(2)
      pushToast('info', 'Sesión demo: María González (Recursos Humanos)')
    } else if (!needsReviewer && current?.id !== 1) {
      startSession(1)
      pushToast('info', 'Sesión demo: Juan Pérez (Funcionario)')
    }
    setConsentOpen(false)
    goTo(target)
  }

  const login = (rutInput: string, clave: string) => {
    const now = Date.now()
    if (loginState.lockedUntil && loginState.lockedUntil > now) {
      const min = Math.ceil((loginState.lockedUntil - now) / 60000)
      setLoginState((s) => ({ ...s, error: `Cuenta bloqueada temporalmente. Intenta en ${min} min.` }))
      return
    }
    if (!isValidRut(rutInput)) {
      setLoginState((s) => ({ ...s, error: 'RUT inválido. Revisa el dígito verificador.', notice: null }))
      return
    }
    if (!clave) {
      setLoginState((s) => ({ ...s, error: 'Ingresa tu contraseña.', notice: null }))
      return
    }
    setConsentBlocked(false)
    setLoginState((s) => ({ ...s, loading: true, error: null, notice: null }))
    later(() => {
      const match = usuarios.find((u) => cleanRut(u.rut) === cleanRut(rutInput) && u.clave === clave)
      if (!match) {
        setLoginState((s) => {
          const attempts = s.attempts + 1
          if (attempts >= MAX_LOGIN_ATTEMPTS) {
            addAudit(rutInput, 'BLOQUEO_CUENTA', '3 intentos fallidos consecutivos. Bloqueo 15 min (TC-NEG-01)')
            return {
              ...s,
              loading: false,
              attempts,
              lockedUntil: Date.now() + LOCKOUT_MS,
              error: 'Credenciales inválidas. Cuenta bloqueada por 15 minutos.',
            }
          }
          addAudit(rutInput, 'LOGIN_FALLIDO', `Intento ${attempts} de ${MAX_LOGIN_ATTEMPTS}`)
          return {
            ...s,
            loading: false,
            attempts,
            error: `Credenciales inválidas. Intento ${attempts} de ${MAX_LOGIN_ATTEMPTS}.`,
          }
        })
        return
      }
      setLoginState((s) => ({ ...s, loading: false, attempts: 0, error: null }))
      setPendingUserId(match.id)
      setConsentOpen(true)
    }, 1100)
  }

  const acceptConsent = () => {
    const id = pendingUserId ?? 1
    const u = usuarios.find((x) => x.id === id)!
    setConsentOpen(false)
    setConsentBlocked(false)
    setPendingUserId(null)
    startSession(id)
    addAudit(`${u.nombres} ${u.apellidos}`, 'CONSENTIMIENTO_ACEPTADO', 'Firma digital de consentimiento informado v1.2')
    addAudit(`${u.nombres} ${u.apellidos}`, 'LOGIN_OK', `Perfil ${u.perfil}`)
    goTo(u.perfil === 'Funcionario' ? 'SCR-02' : 'SCR-08')
  }

  const rejectConsent = () => {
    setConsentOpen(false)
    setPendingUserId(null)
    setConsentBlocked(true)
  }

  const resetLockout = () =>
    setLoginState({ loading: false, error: null, notice: null, attempts: 0, lockedUntil: null })

  const setOnline = (value: boolean) => {
    setOnlineState(value)
    if (!value) pushToast('warning', 'Conexión perdida. Los envíos se guardarán en la Sync Queue.')
    if (screen === 'SCR-05' && !value) setViewerStatus('error')
  }

  useEffect(() => {
    if (!online) return
    const pending = syncQueueRef.current.filter((i) => i.status === 'EN_COLA')
    if (pending.length === 0) return
    pushToast('info', `Conexión restablecida. WorkManager sincronizando ${pending.length} elemento(s).`)
    pending.forEach((item, idx) => {
      later(() => {
        setSyncQueue((q) =>
          q.map((x) => (x.uuid === item.uuid ? { ...x, status: 'SINCRONIZANDO', intentos: x.intentos + 1 } : x)),
        )
      }, 400 + idx * 1500)
      later(() => {
        setSyncQueue((q) => q.map((x) => (x.uuid === item.uuid ? { ...x, status: 'SINCRONIZADO' } : x)))
        setSolicitudes((list) => list.map((s) => (s.id === item.solicitudId ? { ...s, syncPendiente: false } : s)))
        setDocCount((c) => c + 1)
        addAudit('WorkManager', 'SYNC_OK', `${item.operacion} ${item.uuid.slice(0, 8)} sincronizado`)
      }, 1400 + idx * 1500)
    })
  }, [online, later, pushToast, addAudit])

  useEffect(() => {
    if (!sessionUserId) return
    const touchHandler = () => {
      lastActivity.current = Date.now()
    }
    window.addEventListener('pointerdown', touchHandler)
    window.addEventListener('keydown', touchHandler)
    const interval = window.setInterval(() => {
      setTick(Date.now())
      if (Date.now() - lastActivity.current > SESSION_TIMEOUT_MS) {
        setSessionUserId(null)
        setReviewTarget(null)
        setHelpOpen(false)
        setScreen('SCR-01')
        setLoginState((s) => ({
          ...s,
          notice: 'Tu sesión expiró por inactividad (5 min). Ingresa nuevamente.',
        }))
        setAudit((a) => [
          { id: uuid(), ts: nowIso(), usuario: 'Sistema', accion: 'SESION_EXPIRADA', detalle: 'Inactividad > 5:00 (TC-RNF-02)' },
          ...a,
        ])
      }
    }, 1000)
    return () => {
      window.removeEventListener('pointerdown', touchHandler)
      window.removeEventListener('keydown', touchHandler)
      window.clearInterval(interval)
    }
  }, [sessionUserId])

  const simulateInactivity = () => {
    lastActivity.current = Date.now() - SESSION_TIMEOUT_MS - 1000
  }

  const sessionRemainingMs = sessionUserId
    ? Math.max(0, SESSION_TIMEOUT_MS - (tick - lastActivity.current))
    : null

  const setDraft = (partial: Partial<UploadDraft>) => setDraftState((d) => ({ ...d, ...partial }))
  const resetDraft = () => {
    setDraftState(emptyDraft())
    setUploadError(null)
  }

  const submitDraft = (): SubmitResult => {
    if (solicitudes.some((s) => s.id === draft.id)) return { status: 'duplicate' }
    folioCounter.current += 1
    const folio = `SOL-2026-0${folioCounter.current}`
    const esPermiso = draft.tipo === 'Permiso Administrativo'
    const nueva: Solicitud = {
      id: draft.id,
      folio,
      tipo: esPermiso ? 'PERMISO' : 'DOCUMENTO',
      titulo: draft.correccionDe ? `${draft.tipo} (reinsertada)` : draft.tipo || 'Documento',
      tipoDocumento: draft.tipo,
      fecha: draft.fecha,
      estado: 'PENDIENTE_REVISION',
      observacion: draft.observacion ? escapeHtml(draft.observacion) : undefined,
      funcionario: `${funcionario.nombres} ${funcionario.apellidos}`,
      rutFuncionario: funcionario.rut,
      centro: funcionario.centro,
      adjunto: draft.archivo ?? 'Captura_camara.jpg',
      ambito: esPermiso ? 'JEFATURA' : 'RRHH',
      valorAnterior: 'Sin registro',
      valorNuevo: `${draft.tipo} con fecha ${draft.fecha}`,
      syncPendiente: !online,
    }
    setSolicitudes((list) => [nueva, ...list])
    const actor = `${funcionario.nombres} ${funcionario.apellidos}`
    if (!online) {
      const item: SyncItem = {
        uuid: uuid(),
        ts: nowIso(),
        operacion: 'POST /documentos',
        titulo: `${draft.tipo} · ${folio}`,
        status: 'EN_COLA',
        intentos: 0,
        solicitudId: nueva.id,
      }
      setSyncQueue((q) => [item, ...q])
      addAudit(actor, 'SYNC_ENCOLADO', `${folio} guardado en Sync Queue (UUID ${item.uuid.slice(0, 8)})`)
      pushToast('warning', `Sin conexión: ${folio} quedó en la cola de sincronización.`)
      return { status: 'queued', folio }
    }
    setDocCount((c) => c + 1)
    setDocumentos((d) => [
      {
        id: `doc-${uuid().slice(0, 6)}`,
        titulo: `${(draft.tipo || 'Documento').replace(/\s/g, '_')}_${draft.fecha}.pdf`,
        tipo: draft.tipo,
        fecha: draft.fecha,
        tamano: '1,8 MB',
        hash: uuid().replace(/-/g, '').padEnd(64, '0').slice(0, 64),
        paginas: 1,
      },
      ...d,
    ])
    addAudit(actor, 'CARGA_DOCUMENTO', `${folio} · ${draft.tipo} · hash SHA-256 registrado`)
    pushToast('success', `Documento enviado correctamente. Folio ${folio}.`)
    later(notifyLocal, 2600)
    return { status: 'sent', folio }
  }

  const openViewer = (docId: string) => {
    setViewerDocId(docId)
    goTo('SCR-05')
  }

  const retryViewer = () => startViewerLoad(online)

  const correctRequest = (id: string) => {
    const s = solicitudes.find((x) => x.id === id)
    if (!s) return
    setDraftState({ ...emptyDraft(), tipo: s.tipoDocumento ?? '', correccionDe: s.folio })
    setUploadError(null)
    goTo('SCR-03')
  }

  const saveContact = () => {
    const errors: Partial<Record<keyof ContactDraft, string>> = {}
    if (hasInjection(contactDraft.telefono)) errors.telefono = 'Se detectaron caracteres no permitidos. Envío bloqueado.'
    else if (!isValidPhone(contactDraft.telefono)) errors.telefono = 'Formato inválido. Usa +56 9 XXXX XXXX.'
    if (hasInjection(contactDraft.correo)) errors.correo = 'Se detectaron caracteres no permitidos. Envío bloqueado.'
    else if (!isValidEmail(contactDraft.correo)) errors.correo = 'Correo inválido. Ej: nombre@cmquilpue.cl'
    setContactErrors(errors)
    if (Object.keys(errors).length > 0) return false
    setUsuarios((list) =>
      list.map((u) =>
        u.id === 1 ? { ...u, telefono: contactDraft.telefono.trim(), correo: contactDraft.correo.trim() } : u,
      ),
    )
    addAudit(`${funcionario.nombres} ${funcionario.apellidos}`, 'UPDATE_CONTACTO', 'Teléfono/correo actualizado (BDD-01)')
    pushToast('success', 'Datos de contacto actualizados correctamente')
    return true
  }

  const submitOfficialChange = (campo: 'Nombre' | 'RUT', valorNuevo: string, adjunto: string) => {
    folioCounter.current += 1
    const folio = `SOL-2026-0${folioCounter.current}`
    const valorAnterior = campo === 'RUT' ? funcionario.rut : `${funcionario.nombres} ${funcionario.apellidos}`
    const nueva: Solicitud = {
      id: `sol-${uuid().slice(0, 8)}`,
      folio,
      tipo: 'DATO_OFICIAL',
      titulo: `Cambio de ${campo === 'RUT' ? 'RUT' : 'nombre'} oficial`,
      fecha: new Date().toISOString().slice(0, 10),
      estado: 'PENDIENTE_REVISION',
      funcionario: `${funcionario.nombres} ${funcionario.apellidos}`,
      rutFuncionario: funcionario.rut,
      centro: funcionario.centro,
      campo,
      valorAnterior,
      valorNuevo: escapeHtml(valorNuevo.trim()),
      adjunto,
      ambito: 'RRHH',
    }
    setSolicitudes((list) => [nueva, ...list])
    addAudit(
      `${funcionario.nombres} ${funcionario.apellidos}`,
      'SOLICITUD_MODIFICACION',
      `${folio} · ${campo} · PENDIENTE_REVISION (BDD-02)`,
    )
    pushToast('info', `Solicitud ${folio} enviada a Recursos Humanos. Estado: PENDIENTE_REVISION.`)
  }

  const reviewerName = user ? `${user.nombres} ${user.apellidos.split(' ')[0]}` : 'Revisor'
  const reviewerLabel = `${reviewerName} (${reviewerRole === 'RRHH' ? 'RR. HH.' : 'Jefatura'})`

  const approve = (id: string) => {
    const s = solicitudes.find((x) => x.id === id)
    if (!s) return
    setSolicitudes((list) =>
      list.map((x) =>
        x.id === id
          ? { ...x, estado: 'APROBADO', revisor: reviewerLabel, fechaRevision: new Date().toISOString().slice(0, 10) }
          : x,
      ),
    )
    if (s.rutFuncionario === funcionario.rut) {
      if (s.tipo === 'DATO_OFICIAL' && s.valorNuevo) {
        setUsuarios((list) =>
          list.map((u) => {
            if (u.id !== 1) return u
            if (s.campo === 'RUT') return { ...u, rut: s.valorNuevo! }
            const [nombres, ...rest] = s.valorNuevo!.split(' ')
            return { ...u, nombres, apellidos: rest.join(' ') || u.apellidos }
          }),
        )
      }
      if (s.tipo === 'PERMISO') setDiasAdmin((d) => ({ ...d, disponibles: Math.max(0, d.disponibles - 1) }))
      notifyLocal()
    }
    addAudit(reviewerLabel, 'SOLICITUD_APROBADA', `${s.folio} · ${s.funcionario}`)
    pushToast('success', `Solicitud ${s.folio} aprobada.`)
    setReviewTarget(null)
  }

  const reject = (id: string, motivo: string) => {
    const s = solicitudes.find((x) => x.id === id)
    if (!s) return
    setSolicitudes((list) =>
      list.map((x) =>
        x.id === id
          ? {
              ...x,
              estado: 'RECHAZADO',
              motivoRechazo: escapeHtml(motivo.trim()),
              revisor: reviewerLabel,
              fechaRevision: new Date().toISOString().slice(0, 10),
            }
          : x,
      ),
    )
    if (s.rutFuncionario === funcionario.rut) notifyLocal()
    addAudit(reviewerLabel, 'SOLICITUD_RECHAZADA', `${s.folio} · motivo registrado (BDD-03)`)
    pushToast('error', `Solicitud ${s.folio} rechazada. Se notificó al funcionario.`)
    setReviewTarget(null)
  }

  const markNotificationsRead = () => setNotifications((list) => list.map((n) => ({ ...n, leida: true })))

  return {
    screen,
    goTo,
    navigateFromEvaluator,
    user,
    funcionario,
    login,
    loginState,
    resetLockout,
    consentOpen,
    consentBlocked,
    acceptConsent,
    rejectConsent,
    logout,
    online,
    setOnline,
    documentos,
    docCount,
    diasAdmin,
    solicitudes,
    audit,
    syncQueue,
    notifications,
    markNotificationsRead,
    phoneBanner,
    toasts,
    pushToast,
    dismissToast,
    dashboardLoading,
    startDashboardLoad,
    lastResponseMs,
    draft,
    setDraft,
    resetDraft,
    onboardingSeen,
    setOnboardingSeen,
    uploadError,
    setUploadError,
    captureBlurry,
    setCaptureBlurry,
    submitDraft,
    viewerDocId,
    openViewer,
    viewerStatus,
    setViewerStatus,
    retryViewer,
    requestFilter,
    setRequestFilter,
    expandedRequestId,
    setExpandedRequestId,
    correctRequest,
    contactDraft,
    setContactDraft,
    contactErrors,
    saveContact,
    submitOfficialChange,
    reviewerRole,
    setReviewerRole,
    reviewTarget,
    setReviewTarget,
    approve,
    reject,
    helpOpen,
    setHelpOpen,
    notifOpen,
    setNotifOpen,
    simulateInactivity,
    sessionRemainingMs,
    setLoginState,
  }
}

export type CmqStore = ReturnType<typeof useStoreValue>

const StoreContext = createContext<CmqStore | null>(null)

export function CmqProvider({ children }: { children: React.ReactNode }) {
  const value = useStoreValue()
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useCmq() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useCmq must be used within CmqProvider')
  return ctx
}
