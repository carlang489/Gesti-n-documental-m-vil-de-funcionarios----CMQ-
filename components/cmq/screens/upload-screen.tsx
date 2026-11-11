'use client'

import { useRef, useState } from 'react'
import { AlertTriangle, Camera, FileUp, Lightbulb, RotateCcw, Upload, X } from 'lucide-react'
import { useCmq } from '../store'
import { FieldError, ScreenHeader, inputClass, textareaClass } from '../ui'
import { TIPOS_DOCUMENTO } from '@/lib/cmq/data'
import { hasInjection, validateFile } from '@/lib/cmq/validation'

export function UploadScreen() {
  const { draft, setDraft, goTo, onboardingSeen, setOnboardingSeen, uploadError, setUploadError } = useCmq()
  const fileRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<{ tipo?: string; fecha?: string; observacion?: string }>({})

  const validateForm = () => {
    const next: typeof errors = {}
    if (!draft.tipo) next.tipo = 'Selecciona el tipo documental.'
    if (!draft.fecha) next.fecha = 'Indica la fecha del documento.'
    if (draft.observacion && hasInjection(draft.observacion)) {
      next.observacion = 'Se detectaron caracteres o código no permitido. Envío bloqueado.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onCamera = () => {
    if (!validateForm()) return
    setUploadError(null)
    setDraft({ origen: 'camara', archivo: 'Captura_camara.jpg' })
    goTo('SCR-04')
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const error = validateFile(file.name, file.size)
    if (error) {
      setUploadError(`${error}: "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB). Solo PDF, JPG o PNG hasta 10 MB.`)
      return
    }
    if (!validateForm()) return
    setUploadError(null)
    setDraft({ origen: 'archivo', archivo: file.name })
    goTo('SCR-04')
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Cargar documento"
        subtitle={draft.correccionDe ? `Corrección de ${draft.correccionDe}` : 'Digitalización de expediente'}
        onBack={() => goTo('SCR-02')}
      />

      <div className="flex flex-col gap-4 p-4">
        {!onboardingSeen && (
          <div role="note" className="relative flex gap-3 rounded-xl bg-secondary p-4 pr-10 text-secondary-foreground animate-in fade-in-0 slide-in-from-top-2">
            <Lightbulb className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">Guía de encuadre</p>
              <p className="text-xs leading-relaxed">
                Coloque el documento sobre una superficie plana e iluminada. Asegúrese de que las 4 esquinas queden
                dentro del recuadro.
              </p>
              <button
                type="button"
                onClick={() => setOnboardingSeen(true)}
                className="mt-1 self-start rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Entendido
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOnboardingSeen(true)}
              className="absolute top-2 right-2 rounded-full p-1.5 hover:bg-card/60"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Cerrar guía</span>
            </button>
          </div>
        )}

        {draft.correccionDe && (
          <div className="flex items-center gap-2 rounded-xl border border-warning bg-warning-soft p-3 text-xs text-warning-foreground">
            <RotateCcw className="size-4 shrink-0" aria-hidden="true" />
            Reinsertando solicitud rechazada {draft.correccionDe}. Adjunta el documento corregido.
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipo" className="text-sm font-medium">
            Tipo documental
          </label>
          <select
            id="tipo"
            value={draft.tipo}
            onChange={(e) => setDraft({ tipo: e.target.value })}
            className={inputClass}
            aria-invalid={!!errors.tipo}
          >
            <option value="">Selecciona un tipo…</option>
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.tipo && <FieldError>{errors.tipo}</FieldError>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha" className="text-sm font-medium">
            Fecha del documento
          </label>
          <input
            id="fecha"
            type="date"
            value={draft.fecha}
            max="2026-12-31"
            onChange={(e) => setDraft({ fecha: e.target.value })}
            className={inputClass}
            aria-invalid={!!errors.fecha}
          />
          {errors.fecha && <FieldError>{errors.fecha}</FieldError>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="obs" className="flex items-center justify-between text-sm font-medium">
            Observación <span className="text-xs font-normal text-muted-foreground">Opcional · {draft.observacion.length}/250</span>
          </label>
          <textarea
            id="obs"
            maxLength={250}
            value={draft.observacion}
            onChange={(e) => setDraft({ observacion: e.target.value })}
            placeholder="Ej: Licencia por 3 días, folio 123456"
            className={textareaClass}
            aria-invalid={!!errors.observacion}
          />
          {errors.observacion && <FieldError>{errors.observacion}</FieldError>}
        </div>

        {uploadError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-xs leading-relaxed text-destructive-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Archivo inválido.</strong> {uploadError}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onCamera}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
          >
            <Camera className="size-5" aria-hidden="true" /> Tomar Foto
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-card text-sm font-semibold text-primary"
          >
            <FileUp className="size-5" aria-hidden="true" /> Adjuntar archivo
          </button>
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={onFile}
          />
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Upload className="size-3" aria-hidden="true" /> PDF, JPG o PNG · máximo 10 MB · sin OCR automático
          </p>
        </div>
      </div>
    </div>
  )
}
