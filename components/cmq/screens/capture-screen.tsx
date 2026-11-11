'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, CheckCircle2, Eye, RotateCcw, Send, WifiOff, X } from 'lucide-react'
import { useCmq } from '../store'
import { ScreenHeader, Spinner } from '../ui'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/cmq/validation'

export function CaptureScreen() {
  const { draft, goTo, captureBlurry, setCaptureBlurry, submitDraft, online, resetDraft } = useCmq()
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [retaking, setRetaking] = useState(false)

  const retake = () => {
    setRetaking(true)
    window.setTimeout(() => {
      setRetaking(false)
      setCaptureBlurry(false)
    }, 900)
  }

  const confirm = () => {
    if (sending) return
    setSending(true)
    window.setTimeout(() => {
      const result = submitDraft()
      setSending(false)
      if (result.status !== 'duplicate') {
        resetDraft()
        goTo('SCR-06')
      }
    }, online ? 1000 : 400)
  }

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader title="Confirmar captura" subtitle={draft.tipo || 'Documento'} onBack={() => goTo('SCR-03')} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sidebar">
          {retaking ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sidebar-foreground">
              <Spinner className="size-6" />
              <span className="text-xs">Abriendo cámara…</span>
            </div>
          ) : (
            <>
              <Image
                src="/images/captured-document.png"
                alt={`Fotografía capturada del documento: ${draft.tipo || 'documento'}`}
                fill
                sizes="(max-width: 448px) 100vw, 400px"
                className={cn('object-cover transition', captureBlurry && 'scale-105 blur-[3px]')}
                priority
              />
              <div className="pointer-events-none absolute inset-6" aria-hidden="true">
                <span className="absolute top-0 left-0 size-8 rounded-tl-lg border-t-4 border-l-4 border-primary-foreground" />
                <span className="absolute top-0 right-0 size-8 rounded-tr-lg border-t-4 border-r-4 border-primary-foreground" />
                <span className="absolute bottom-0 left-0 size-8 rounded-bl-lg border-b-4 border-l-4 border-primary-foreground" />
                <span className="absolute right-0 bottom-0 size-8 rounded-br-lg border-r-4 border-b-4 border-primary-foreground" />
              </div>
              <span
                className={cn(
                  'absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shadow',
                  captureBlurry ? 'bg-warning text-warning-foreground' : 'bg-primary text-primary-foreground',
                )}
              >
                {captureBlurry ? (
                  <>
                    <AlertTriangle className="size-3.5" aria-hidden="true" /> Enfoque insuficiente
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" aria-hidden="true" /> Documento encuadrado
                  </>
                )}
              </span>
            </>
          )}
        </div>

        {captureBlurry && !retaking && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-warning bg-warning-soft p-3 text-xs leading-relaxed text-warning-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">La imagen parece borrosa o fuera de foco.</strong> Te sugerimos
              repetir la foto con mejor iluminación y el teléfono estable.
            </span>
          </div>
        )}

        {!online && (
          <div className="flex items-start gap-2 rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Sin conexión: al confirmar, el envío se guardará cifrado en la cola local y se sincronizará
            automáticamente.
          </div>
        )}

        <dl className="grid grid-cols-2 gap-2 rounded-xl border bg-card p-3 text-xs">
          <div className="flex flex-col">
            <dt className="text-muted-foreground">Tipo</dt>
            <dd className="font-medium">{draft.tipo || '—'}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="font-medium">{draft.fecha ? formatDate(draft.fecha) : '—'}</dd>
          </div>
          <div className="col-span-2 flex flex-col">
            <dt className="text-muted-foreground">Archivo</dt>
            <dd className="truncate font-mono font-medium">{draft.archivo ?? 'Captura_camara.jpg'}</dd>
          </div>
        </dl>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={retake}
            disabled={sending}
            className={cn(
              'flex h-12 items-center justify-center gap-2 rounded-xl border-2 bg-card text-sm font-semibold disabled:opacity-50',
              captureBlurry ? 'border-warning text-warning-foreground' : 'border-input text-foreground',
            )}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Repetir foto
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            disabled={sending || retaking}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground disabled:opacity-50"
          >
            <Eye className="size-4" aria-hidden="true" /> Previsualizar
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={sending || retaking}
            className="col-span-2 flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 disabled:opacity-60"
          >
            {sending ? (
              <>
                <Spinner /> {online ? 'Enviando…' : 'Guardando en cola…'}
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden="true" /> Confirmar y enviar
              </>
            )}
          </button>
        </div>
      </div>

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Previsualización del documento"
          className="absolute inset-0 z-40 flex flex-col bg-sidebar animate-in fade-in-0"
        >
          <div className="flex items-center justify-between px-4 py-3 text-sidebar-foreground">
            <span className="text-sm font-medium">Previsualización</span>
            <button type="button" onClick={() => setPreview(false)} className="rounded-full p-2 hover:bg-sidebar-accent">
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Cerrar previsualización</span>
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              src="/images/captured-document.png"
              alt="Documento capturado en tamaño completo"
              fill
              sizes="400px"
              className={cn('object-contain', captureBlurry && 'blur-[3px]')}
            />
          </div>
          <p className="px-4 py-3 text-center text-[11px] text-sidebar-foreground/80">
            La imagen se mantiene en memoria temporal cifrada hasta su envío.
          </p>
        </div>
      )}
    </div>
  )
}
