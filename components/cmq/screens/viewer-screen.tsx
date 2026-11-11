'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Lock, RefreshCw, ShieldCheck, WifiOff, ZoomIn, ZoomOut } from 'lucide-react'
import { useCmq } from '../store'
import { ScreenHeader, Spinner } from '../ui'
import { formatDate } from '@/lib/cmq/validation'

const CLAUSULAS = [
  {
    t: 'PRIMERO: Del cargo',
    p: 'La Corporación contrata al trabajador para desempeñar funciones de Técnico en Enfermería de Nivel Superior en el Centro de Salud Familiar (CESFAM) Quilpué, conforme a la Ley N° 19.378 Estatuto de Atención Primaria de Salud Municipal.',
  },
  {
    t: 'SEGUNDO: De la jornada',
    p: 'La jornada ordinaria será de 44 horas semanales, distribuidas de lunes a viernes según la programación del establecimiento, con los turnos que determine la Dirección.',
  },
  {
    t: 'TERCERO: De la remuneración',
    p: 'El trabajador percibirá la remuneración correspondiente a su categoría y nivel de carrera funcionaria, más las asignaciones legales que procedan, pagadera por mes vencido.',
  },
  {
    t: 'CUARTO: Vigencia',
    p: 'El presente contrato tendrá vigencia desde el 02 de enero de 2026 hasta el 31 de diciembre de 2026, pudiendo renovarse según evaluación de desempeño.',
  },
]

export function ViewerScreen() {
  const { documentos, viewerDocId, viewerStatus, retryViewer, goTo, funcionario, online } = useCmq()
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const doc = documentos.find((d) => d.id === viewerDocId) ?? documentos[0]

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={doc.titulo}
        subtitle={`${doc.tipo} · ${formatDate(doc.fecha)} · ${doc.tamano}`}
        onBack={() => goTo('SCR-02')}
        right={
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
            <Eye className="size-3.5" aria-hidden="true" /> Solo lectura
          </span>
        }
      />

      <div className="relative flex-1 overflow-hidden bg-muted">
        {viewerStatus === 'loading' && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground" aria-busy="true">
            <Spinner className="size-7 text-primary" />
            <p className="text-sm">Descifrando documento en memoria…</p>
          </div>
        )}

        {viewerStatus === 'error' && (
          <div role="alert" className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-destructive-soft text-destructive">
              <WifiOff className="size-7" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold">No se pudo cargar el documento</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {online
                  ? 'Ocurrió un error al conectar con el repositorio documental.'
                  : 'No hay conexión a internet. El documento se obtiene de forma segura desde el repositorio corporativo.'}
              </p>
            </div>
            <button
              type="button"
              onClick={retryViewer}
              className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Reintentar conexión
            </button>
          </div>
        )}

        {viewerStatus === 'ready' && (
          <div className="cmq-scroll h-full overflow-auto p-4">
            <article
              aria-label={`Página ${page} de ${doc.paginas} de ${doc.titulo}`}
              className="relative mx-auto flex origin-top select-none flex-col gap-3 rounded-sm bg-card p-6 text-[10px] leading-relaxed text-foreground shadow-md"
              style={{ width: `${zoom}%`, minWidth: 280 }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
                aria-hidden="true"
              >
                <span className="-rotate-30 text-center text-sm font-semibold whitespace-nowrap text-primary/10">
                  USO INTERNO · {funcionario.rut} · {funcionario.nombres.toUpperCase()}
                </span>
              </div>
              <header className="flex items-center justify-between border-b pb-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">CORPORACIÓN MUNICIPAL DE QUILPUÉ</span>
                  <span className="text-muted-foreground">Área Salud · Departamento de Recursos Humanos</span>
                </div>
                <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              </header>
              <h2 className="text-center text-xs font-bold tracking-wide">
                {doc.tipo === 'Contrato' ? 'CONTRATO DE TRABAJO PLAZO FIJO' : doc.tipo.toUpperCase()}
              </h2>
              <p>
                En Quilpué, a {formatDate(doc.fecha)}, entre la Corporación Municipal de Quilpué, RUT 70.912.300-K, y
                don(ña) {funcionario.nombres} {funcionario.apellidos}, RUT {funcionario.rut}, se ha convenido el
                siguiente contrato:
              </p>
              {CLAUSULAS.slice(page === 1 ? 0 : 2, page === 1 ? 2 : 4).map((c) => (
                <section key={c.t} className="flex flex-col gap-1">
                  <h3 className="font-semibold">{c.t}</h3>
                  <p className="text-muted-foreground">{c.p}</p>
                </section>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-6 pt-6 text-center text-muted-foreground">
                <div className="border-t pt-1">Empleador</div>
                <div className="border-t pt-1">Trabajador</div>
              </div>
              <footer className="flex justify-between border-t pt-2 font-mono text-[8px] text-muted-foreground">
                <span>SHA-256 {doc.hash.slice(0, 16)}…</span>
                <span>
                  Pág. {page}/{doc.paginas}
                </span>
              </footer>
            </article>
          </div>
        )}
      </div>

      {viewerStatus === 'ready' && (
        <div className="flex items-center justify-between border-t bg-card px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg p-2 hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              <span className="sr-only">Página anterior</span>
            </button>
            <span className="text-xs tabular-nums">
              {page} / {doc.paginas}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(doc.paginas, p + 1))}
              disabled={page === doc.paginas}
              className="rounded-lg p-2 hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
              <span className="sr-only">Página siguiente</span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(80, z - 10))}
              className="rounded-lg p-2 hover:bg-muted"
            >
              <ZoomOut className="size-4" aria-hidden="true" />
              <span className="sr-only">Alejar</span>
            </button>
            <span className="w-10 text-center text-xs tabular-nums">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(160, z + 10))}
              className="rounded-lg p-2 hover:bg-muted"
            >
              <ZoomIn className="size-4" aria-hidden="true" />
              <span className="sr-only">Acercar</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 bg-secondary px-4 py-3 text-xs leading-relaxed text-secondary-foreground">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Visualización segura dentro de la app</strong> (el archivo no se guarda en
          la memoria de tu teléfono).
        </p>
      </div>
    </div>
  )
}
