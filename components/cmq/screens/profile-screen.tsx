'use client'

import { useRef, useState } from 'react'
import { BadgeCheck, Clock, FileCheck2, LogOut, Mail, Paperclip, Phone, Save, ShieldCheck } from 'lucide-react'
import { useCmq } from '../store'
import { Card, FieldError, ScreenHeader, StatusChip, inputClass } from '../ui'
import { hasInjection, isValidRut, validateFile } from '@/lib/cmq/validation'

export function ProfileScreen() {
  const {
    funcionario,
    contactDraft,
    setContactDraft,
    contactErrors,
    saveContact,
    submitOfficialChange,
    solicitudes,
    goTo,
    logout,
  } = useCmq()
  const fileRef = useRef<HTMLInputElement>(null)
  const [campo, setCampo] = useState<'Nombre' | 'RUT'>('Nombre')
  const [valorNuevo, setValorNuevo] = useState('')
  const [adjunto, setAdjunto] = useState<string | null>(null)
  const [officialError, setOfficialError] = useState<string | null>(null)

  const pendientesOficiales = solicitudes.filter(
    (s) => s.tipo === 'DATO_OFICIAL' && s.rutFuncionario === funcionario.rut,
  )

  const contactChanged =
    contactDraft.telefono !== funcionario.telefono || contactDraft.correo !== funcionario.correo

  const onAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const error = validateFile(file.name, file.size)
    if (error) {
      setOfficialError(`${error}. Adjunta un PDF, JPG o PNG de hasta 10 MB.`)
      setAdjunto(null)
      return
    }
    setOfficialError(null)
    setAdjunto(file.name)
  }

  const onSubmitOfficial = (e: React.FormEvent) => {
    e.preventDefault()
    const value = valorNuevo.trim()
    if (!value) return setOfficialError(`Ingresa el nuevo ${campo === 'RUT' ? 'RUT' : 'nombre completo'}.`)
    if (hasInjection(value)) return setOfficialError('Se detectaron caracteres no permitidos. Envío bloqueado.')
    if (campo === 'RUT' && !isValidRut(value)) return setOfficialError('El RUT ingresado no es válido.')
    if (campo === 'Nombre' && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{5,}$/.test(value))
      return setOfficialError('El nombre solo puede contener letras y espacios.')
    if (!adjunto) return setOfficialError('Debes adjuntar el documento probatorio (ej. certificado de nacimiento).')
    submitOfficialChange(campo, value, adjunto)
    setValorNuevo('')
    setAdjunto(null)
    setOfficialError(null)
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Mi Perfil"
        subtitle="Datos personales y de contacto"
        onBack={() => goTo('SCR-02')}
        right={
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive-soft"
          >
            <LogOut className="size-4" aria-hidden="true" /> Salir
          </button>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Datos oficiales vigentes</h2>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2 flex flex-col">
              <dt className="text-muted-foreground">Nombre completo</dt>
              <dd className="text-sm font-medium">
                {funcionario.nombres} {funcionario.apellidos}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-muted-foreground">RUT</dt>
              <dd className="font-mono text-sm font-medium">{funcionario.rut}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-muted-foreground">Centro</dt>
              <dd className="text-sm font-medium">{funcionario.centro}</dd>
            </div>
          </dl>
        </Card>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveContact()
          }}
          noValidate
        >
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Mis Datos de Contacto</h2>
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                Edición directa
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="telefono" className="flex items-center gap-1.5 text-xs font-medium">
                <Phone className="size-3.5" aria-hidden="true" /> Teléfono móvil
              </label>
              <input
                id="telefono"
                type="tel"
                inputMode="tel"
                value={contactDraft.telefono}
                onChange={(e) => setContactDraft({ ...contactDraft, telefono: e.target.value })}
                className={`${inputClass} font-mono`}
                aria-invalid={!!contactErrors.telefono}
                aria-describedby={contactErrors.telefono ? 'err-tel' : undefined}
              />
              {contactErrors.telefono && <FieldError id="err-tel">{contactErrors.telefono}</FieldError>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="correo" className="flex items-center gap-1.5 text-xs font-medium">
                <Mail className="size-3.5" aria-hidden="true" /> Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                inputMode="email"
                value={contactDraft.correo}
                onChange={(e) => setContactDraft({ ...contactDraft, correo: e.target.value })}
                className={inputClass}
                aria-invalid={!!contactErrors.correo}
                aria-describedby={contactErrors.correo ? 'err-mail' : undefined}
              />
              {contactErrors.correo && <FieldError id="err-mail">{contactErrors.correo}</FieldError>}
            </div>
            <button
              type="submit"
              disabled={!contactChanged}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <Save className="size-4" aria-hidden="true" /> Guardar Cambios
            </button>
          </Card>
        </form>

        <form onSubmit={onSubmitOfficial} noValidate>
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Cambio de dato oficial</h2>
              <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
                Requiere validación RR. HH.
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              El dato vigente se mantiene hasta que Recursos Humanos apruebe la solicitud con el documento probatorio.
            </p>
            <div role="radiogroup" aria-label="Dato a corregir" className="grid grid-cols-2 gap-2">
              {(['Nombre', 'RUT'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={campo === c}
                  onClick={() => {
                    setCampo(c)
                    setValorNuevo('')
                    setOfficialError(null)
                  }}
                  className={`h-10 rounded-xl border text-sm font-medium ${
                    campo === c ? 'border-primary bg-secondary text-secondary-foreground' : 'bg-card'
                  }`}
                >
                  {c === 'Nombre' ? 'Nombre' : 'RUT'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="valor-nuevo" className="text-xs font-medium">
                Nuevo {campo === 'RUT' ? 'RUT' : 'nombre completo'}
              </label>
              <input
                id="valor-nuevo"
                value={valorNuevo}
                onChange={(e) => setValorNuevo(e.target.value)}
                placeholder={campo === 'RUT' ? '12.345.678-5' : 'Juan Andrés Pérez Morales'}
                className={`${inputClass} ${campo === 'RUT' ? 'font-mono' : ''}`}
                aria-invalid={!!officialError}
              />
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-card text-sm font-medium text-primary"
            >
              {adjunto ? (
                <>
                  <FileCheck2 className="size-4" aria-hidden="true" />
                  <span className="max-w-48 truncate">{adjunto}</span>
                </>
              ) : (
                <>
                  <Paperclip className="size-4" aria-hidden="true" /> Adjuntar documento probatorio
                </>
              )}
            </button>
            <input ref={fileRef} type="file" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onAttach} />
            {!adjunto && (
              <button
                type="button"
                onClick={() => setAdjunto('Certificado_Nacimiento_Registro_Civil.pdf')}
                className="self-center text-[11px] font-medium text-muted-foreground underline underline-offset-2"
              >
                Usar archivo de ejemplo (demo)
              </button>
            )}
            {officialError && <FieldError>{officialError}</FieldError>}
            <button
              type="submit"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background"
            >
              <BadgeCheck className="size-4" aria-hidden="true" /> Enviar solicitud a RR. HH.
            </button>
          </Card>
        </form>

        {pendientesOficiales.length > 0 && (
          <section aria-labelledby="sol-oficiales" className="flex flex-col gap-2">
            <h2 id="sol-oficiales" className="text-sm font-semibold">
              Solicitudes de datos oficiales
            </h2>
            {pendientesOficiales.map((s) => (
              <Card key={s.id} className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{s.titulo}</span>
                  <StatusChip estado={s.estado} />
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="line-through">{s.valorAnterior}</span> → {s.valorNuevo}
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <Clock className="size-3" aria-hidden="true" />
                  {s.folio} · estado {s.estado}
                </p>
                {s.motivoRechazo && (
                  <p className="rounded-lg bg-destructive-soft p-2 text-xs text-destructive-foreground">
                    Motivo: {s.motivoRechazo}
                  </p>
                )}
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
