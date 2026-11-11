import type { ScreenId } from './types'

export interface ScreenRequirement {
  id: ScreenId
  componentes: string[]
  estados: string[]
}

export const REQ_PANTALLAS: ScreenRequirement[] = [
  {
    id: 'SCR-01',
    componentes: ['Logo "CMQ Salud"', 'Campos RUT y Contraseña', 'Botón "Ingresar"', 'Modal de Consentimiento con checkbox'],
    estados: ['Error "Credenciales inválidas"', 'Indicador de carga en botón', 'Aviso de bloqueo sin consentimiento'],
  },
  {
    id: 'SCR-02',
    componentes: ['Ficha "Juan Pérez - CESFAM Quilpué"', 'Documentos (12)', 'Pendientes (1)', 'Días administrativos (6/10)', 'FAB central de carga'],
    estados: ['Banner amarillo "Modo sin conexión"', 'Skeleton screen durante carga'],
  },
  {
    id: 'SCR-03',
    componentes: ['Tooltip guía de encuadre', 'Selector de Tipo Documental', 'Campo Fecha', 'Botón Tomar Foto / Adjuntar'],
    estados: ['Aviso de archivo inválido o > 10 MB'],
  },
  {
    id: 'SCR-04',
    componentes: ['Previsualización con recuadro', '[Repetir foto]', '[Previsualizar]', '[Confirmar y enviar]'],
    estados: ['Aviso de imagen borrosa con sugerencia de reintento'],
  },
  {
    id: 'SCR-05',
    componentes: ['Lector PDF en memoria', 'Icono de ojo (solo lectura)', 'Banner inferior de visualización segura'],
    estados: ['Falla de carga sin red + "Reintentar conexión"'],
  },
  {
    id: 'SCR-06',
    componentes: ['Pestaña inferior "Mis Solicitudes"', 'Chips Pendiente / Aprobado / Rechazado', 'Ficha desplegable con puntaje de capacitación'],
    estados: ['Motivo de rechazo en rojo', '"Corregir y reinsertar"'],
  },
  {
    id: 'SCR-07',
    componentes: ['Edición directa teléfono/correo', 'Cambio oficial nombre/RUT con adjunto', 'Estado PENDIENTE_REVISION'],
    estados: ['Alerta de formato de teléfono o correo inválido'],
  },
  {
    id: 'SCR-08',
    componentes: ['Selector de rol RRHH / Jefatura', 'Lista de pendientes', 'Modal valor anterior vs nuevo', 'Aprobar / Rechazar con motivo'],
    estados: ['Rechazar bloqueado si el motivo está vacío'],
  },
]

export type TestActionId =
  | 'TC-NEG-01'
  | 'TC-NEG-02'
  | 'TC-NEG-03'
  | 'TC-NEG-04'
  | 'TC-RNF-01'
  | 'TC-RNF-02'
  | 'BDD-01'
  | 'BDD-02'
  | 'BDD-03'

export interface TestCase {
  id: TestActionId
  categoria: string
  condicion: string
  esperado: string
  tipo: 'Funcional' | 'No funcional'
}

export const CASOS_PRUEBA: TestCase[] = [
  {
    id: 'BDD-01',
    tipo: 'Funcional',
    categoria: 'Modificación directa de contacto (RF12)',
    condicion: 'Funcionario modifica su teléfono con formato válido y presiona "Guardar Cambios".',
    esperado: 'Actualización inmediata, registro en LOG_AUDITORIA y confirmación "Datos de contacto actualizados correctamente".',
  },
  {
    id: 'BDD-02',
    tipo: 'Funcional',
    categoria: 'Cambio de dato oficial (RF12)',
    condicion: 'Funcionario solicita corregir nombre o RUT adjuntando documento probatorio.',
    esperado: 'Solicitud en PENDIENTE_REVISION, dato vigente se mantiene y se notifica a RR. HH.',
  },
  {
    id: 'BDD-03',
    tipo: 'Funcional',
    categoria: 'Rechazo por RR. HH. (RF12)',
    condicion: 'RR. HH. selecciona "Rechazar" e ingresa obligatoriamente el motivo.',
    esperado: 'Estado RECHAZADO con autor, fecha y observación; funcionario notificado y puede reinsertar.',
  },
  {
    id: 'TC-NEG-01',
    tipo: 'No funcional',
    categoria: 'Autenticación fallida',
    condicion: 'RUT válido con contraseña incorrecta 3 veces consecutivas.',
    esperado: 'Bloqueo temporal de 15 minutos y registro en LOG_AUDITORIA.',
  },
  {
    id: 'TC-NEG-02',
    tipo: 'No funcional',
    categoria: 'Validación de archivos',
    condicion: 'Subir un archivo .exe o con peso superior a 10 MB.',
    esperado: 'Rechazo antes del envío con alerta "Formato o tamaño no permitido".',
  },
  {
    id: 'TC-NEG-03',
    tipo: 'No funcional',
    categoria: 'Inyección de caracteres (RF12)',
    condicion: 'Insertar scripts o HTML/SQL en el campo motivo o teléfono.',
    esperado: 'Sanitización, escape de caracteres y bloqueo del envío.',
  },
  {
    id: 'TC-NEG-04',
    tipo: 'No funcional',
    categoria: 'Corte súbito de red',
    condicion: 'Desconexión al presionar "Confirmar y enviar".',
    esperado: 'Almacenamiento seguro en Sync Queue local sin duplicar ni perder el registro.',
  },
  {
    id: 'TC-RNF-01',
    tipo: 'No funcional',
    categoria: 'Rendimiento (tiempo de respuesta)',
    condicion: 'Medir desde la solicitud de carga hasta el renderizado de pantalla.',
    esperado: 'Respuesta inferior a 3 segundos en redes móviles estándar.',
  },
  {
    id: 'TC-RNF-02',
    tipo: 'No funcional',
    categoria: 'Expiración de sesión',
    condicion: 'App abierta sin interacción durante 5 minutos y 1 segundo.',
    esperado: 'Cierre automático de sesión y redirección obligatoria al Login.',
  },
]
