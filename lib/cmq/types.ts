export type ScreenId =
  | 'SCR-01'
  | 'SCR-02'
  | 'SCR-03'
  | 'SCR-04'
  | 'SCR-05'
  | 'SCR-06'
  | 'SCR-07'
  | 'SCR-08'

export type Perfil = 'Funcionario' | 'Recursos Humanos' | 'Jefatura'

export interface Usuario {
  id: number
  rut: string
  clave: string
  nombres: string
  apellidos: string
  perfil: Perfil
  centro: string
  cargo: string
  telefono: string
  correo: string
}

export type EstadoSolicitud = 'PENDIENTE_REVISION' | 'APROBADO' | 'RECHAZADO'
export type TipoSolicitud = 'DOCUMENTO' | 'PERMISO' | 'DATO_OFICIAL'
export type AmbitoRevision = 'RRHH' | 'JEFATURA'

export interface Solicitud {
  id: string
  folio: string
  tipo: TipoSolicitud
  titulo: string
  tipoDocumento?: string
  fecha: string
  estado: EstadoSolicitud
  observacion?: string
  motivoRechazo?: string
  revisor?: string
  fechaRevision?: string
  horasCapacitacion?: number
  funcionario: string
  rutFuncionario: string
  centro: string
  campo?: 'Nombre' | 'RUT'
  valorAnterior?: string
  valorNuevo?: string
  adjunto?: string
  ambito: AmbitoRevision
  syncPendiente?: boolean
}

export interface Documento {
  id: string
  titulo: string
  tipo: string
  fecha: string
  tamano: string
  hash: string
  paginas: number
}

export interface AuditEntry {
  id: string
  ts: string
  usuario: string
  accion: string
  detalle: string
}

export type SyncStatus = 'EN_COLA' | 'SINCRONIZANDO' | 'SINCRONIZADO'

export interface SyncItem {
  uuid: string
  ts: string
  operacion: string
  titulo: string
  status: SyncStatus
  intentos: number
  solicitudId: string
}

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  tone: ToastTone
  message: string
}

export interface LocalNotification {
  id: string
  ts: string
  text: string
  leida: boolean
}

export interface UploadDraft {
  tipo: string
  fecha: string
  observacion: string
  archivo?: string
  origen?: 'camara' | 'archivo'
  correccionDe?: string
}

export interface ContactDraft {
  telefono: string
  correo: string
}
