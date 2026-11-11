import type { Documento, ScreenId, Solicitud, Usuario } from './types'

export const USUARIOS: Usuario[] = [
  {
    id: 1,
    rut: '12.345.678-5',
    clave: 'Cmq2026*',
    nombres: 'Juan',
    apellidos: 'Pérez Morales',
    perfil: 'Funcionario',
    centro: 'CESFAM Quilpué',
    cargo: 'Técnico en Enfermería (TENS)',
    telefono: '+56 9 8765 4321',
    correo: 'juan.perez@cmquilpue.cl',
  },
  {
    id: 2,
    rut: '15.678.432-K',
    clave: 'Rrhh2026*',
    nombres: 'María',
    apellidos: 'González Ruiz',
    perfil: 'Recursos Humanos',
    centro: 'Dirección de Salud CMQ',
    cargo: 'Analista de Recursos Humanos',
    telefono: '+56 9 7654 1122',
    correo: 'maria.gonzalez@cmquilpue.cl',
  },
  {
    id: 3,
    rut: '9.876.543-3',
    clave: 'Jefe2026*',
    nombres: 'Pedro',
    apellidos: 'Soto Valdés',
    perfil: 'Jefatura',
    centro: 'CESFAM Quilpué',
    cargo: 'Jefe de Unidad de Enfermería',
    telefono: '+56 9 6543 9988',
    correo: 'pedro.soto@cmquilpue.cl',
  },
]

export const TIPOS_DOCUMENTO = [
  'Contrato',
  'Licencia Médica',
  'Certificado Capacitación',
  'Permiso Administrativo',
] as const

export const DOCUMENTOS_INICIALES: Documento[] = [
  {
    id: 'doc-1',
    titulo: 'Contrato_Laboral_2026.pdf',
    tipo: 'Contrato',
    fecha: '2026-01-02',
    tamano: '1,2 MB',
    hash: 'a3f9c1e07b2d4e8f9a6c5b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f',
    paginas: 3,
  },
  {
    id: 'doc-2',
    titulo: 'Certificado_IAAS_2025.pdf',
    tipo: 'Certificado Capacitación',
    fecha: '2025-11-18',
    tamano: '640 KB',
    hash: 'b7e2d4f6a8c0e1d3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1',
    paginas: 1,
  },
  {
    id: 'doc-3',
    titulo: 'Anexo_Jornada_2026.pdf',
    tipo: 'Contrato',
    fecha: '2026-03-10',
    tamano: '480 KB',
    hash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    paginas: 2,
  },
]

export const SOLICITUDES_INICIALES: Solicitud[] = [
  {
    id: 'sol-1',
    folio: 'SOL-2026-0142',
    tipo: 'PERMISO',
    titulo: 'Permiso administrativo (1 día)',
    tipoDocumento: 'Permiso Administrativo',
    fecha: '2026-05-04',
    estado: 'PENDIENTE_REVISION',
    observacion: 'Trámite personal en Registro Civil.',
    funcionario: 'Juan Pérez Morales',
    rutFuncionario: '12.345.678-5',
    centro: 'CESFAM Quilpué',
    ambito: 'JEFATURA',
    valorAnterior: '6 días disponibles',
    valorNuevo: '5 días disponibles (uso 08/05/2026)',
  },
  {
    id: 'sol-2',
    folio: 'SOL-2026-0118',
    tipo: 'DOCUMENTO',
    titulo: 'Certificado Curso IAAS',
    tipoDocumento: 'Certificado Capacitación',
    fecha: '2026-04-12',
    estado: 'APROBADO',
    horasCapacitacion: 40,
    revisor: 'María González (RR. HH.)',
    fechaRevision: '2026-04-15',
    funcionario: 'Juan Pérez Morales',
    rutFuncionario: '12.345.678-5',
    centro: 'CESFAM Quilpué',
    ambito: 'RRHH',
  },
  {
    id: 'sol-3',
    folio: 'SOL-2026-0097',
    tipo: 'DOCUMENTO',
    titulo: 'Licencia médica 3 días',
    tipoDocumento: 'Licencia Médica',
    fecha: '2026-03-21',
    estado: 'RECHAZADO',
    motivoRechazo:
      'La imagen está incompleta: falta la sección B con timbre y firma del profesional. Adjunte nuevamente el documento completo.',
    revisor: 'María González (RR. HH.)',
    fechaRevision: '2026-03-23',
    funcionario: 'Juan Pérez Morales',
    rutFuncionario: '12.345.678-5',
    centro: 'CESFAM Quilpué',
    ambito: 'RRHH',
  },
]

export const SOLICITUDES_OTROS: Solicitud[] = [
  {
    id: 'sol-4',
    folio: 'SOL-2026-0151',
    tipo: 'DATO_OFICIAL',
    titulo: 'Corrección de apellido',
    fecha: '2026-05-06',
    estado: 'PENDIENTE_REVISION',
    funcionario: 'Camila Rojas Fuentes',
    rutFuncionario: '17.432.198-2',
    centro: 'CESFAM Belloto Sur',
    campo: 'Nombre',
    valorAnterior: 'Camila Rojas Fuente',
    valorNuevo: 'Camila Rojas Fuentes',
    adjunto: 'Certificado_Nacimiento.pdf',
    ambito: 'RRHH',
  },
  {
    id: 'sol-5',
    folio: 'SOL-2026-0149',
    tipo: 'PERMISO',
    titulo: 'Permiso administrativo (medio día)',
    tipoDocumento: 'Permiso Administrativo',
    fecha: '2026-05-05',
    estado: 'PENDIENTE_REVISION',
    observacion: 'Control médico de hijo.',
    funcionario: 'Diego Araya Lillo',
    rutFuncionario: '18.221.904-6',
    centro: 'CESFAM Quilpué',
    ambito: 'JEFATURA',
    valorAnterior: '4 días disponibles',
    valorNuevo: '3,5 días disponibles (uso 09/05/2026)',
  },
  {
    id: 'sol-6',
    folio: 'SOL-2026-0147',
    tipo: 'DOCUMENTO',
    titulo: 'Licencia médica 5 días',
    tipoDocumento: 'Licencia Médica',
    fecha: '2026-05-03',
    estado: 'PENDIENTE_REVISION',
    funcionario: 'Valentina Muñoz Cerda',
    rutFuncionario: '16.009.345-1',
    centro: 'SAPU Quilpué',
    adjunto: 'Licencia_Medica_0503.jpg',
    valorAnterior: 'Sin licencia vigente',
    valorNuevo: 'Licencia 03/05 al 07/05/2026',
    ambito: 'RRHH',
  },
]

export interface ScreenMeta {
  id: ScreenId
  nombre: string
  corto: string
}

export const PANTALLAS: ScreenMeta[] = [
  { id: 'SCR-01', nombre: 'Inicio de Sesión y Consentimiento', corto: 'Login' },
  { id: 'SCR-02', nombre: 'Dashboard del Funcionario', corto: 'Dashboard' },
  { id: 'SCR-03', nombre: 'Carga Documental y Digitalización', corto: 'Carga' },
  { id: 'SCR-04', nombre: 'Confirmación Post-Captura', corto: 'Captura' },
  { id: 'SCR-05', nombre: 'Visor PDF Embebido Seguro', corto: 'Visor PDF' },
  { id: 'SCR-06', nombre: 'Historial "Mis Solicitudes"', corto: 'Solicitudes' },
  { id: 'SCR-07', nombre: 'Modificación de Perfil (RF12)', corto: 'Perfil' },
  { id: 'SCR-08', nombre: 'Panel de Aprobación (RF12)', corto: 'Aprobación' },
]

export const FAQ = [
  {
    q: '¿Qué formatos de archivo puedo adjuntar?',
    a: 'Se aceptan PDF, JPG y PNG con un peso máximo de 10 MB por archivo.',
  },
  {
    q: '¿Qué pasa si no tengo señal en el CESFAM?',
    a: 'La app guarda tu envío en una cola local cifrada y lo sincroniza automáticamente cuando recuperes la conexión.',
  },
  {
    q: '¿Por qué no puedo cambiar mi nombre o RUT directamente?',
    a: 'Los datos oficiales requieren validación de Recursos Humanos con un documento probatorio (RF12). Teléfono y correo sí se editan al instante.',
  },
  {
    q: '¿Los documentos quedan guardados en mi teléfono?',
    a: 'No. El visor embebido muestra el archivo en memoria privada de la app y lo descarta al cerrar.',
  },
]
