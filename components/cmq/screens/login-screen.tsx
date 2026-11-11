'use client'

import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Info, Lock, ShieldAlert } from 'lucide-react'
import { useCmq } from '../store'
import { FieldError, Logo, Modal, Spinner, inputClass } from '../ui'
import { formatRut } from '@/lib/cmq/validation'

export function LoginScreen() {
  const { login, loginState, consentOpen, consentBlocked, acceptConsent, rejectConsent } = useCmq()
  const [rut, setRut] = useState('')
  const [clave, setClave] = useState('')
  const [showClave, setShowClave] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const locked = !!loginState.lockedUntil && loginState.lockedUntil > Date.now()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAccepted(false)
    login(rut, clave)
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex flex-col items-center gap-6 bg-primary px-6 pt-12 pb-10 text-primary-foreground">
        <div className="flex items-center justify-center rounded-3xl bg-card p-4 shadow-lg">
          <Logo size="lg" className="text-foreground" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium opacity-90">Área Salud</p>
          <h1 className="text-xl font-semibold text-balance">Expediente Laboral Digital</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="-mt-5 flex flex-1 flex-col gap-4 rounded-t-3xl bg-card px-6 pt-7 pb-6">
        {loginState.notice && (
          <div role="status" className="flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-xs leading-relaxed text-warning-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {loginState.notice}
          </div>
        )}
        {consentBlocked && (
          <div role="alert" className="flex items-start gap-2 rounded-xl bg-destructive-soft p-3 text-xs leading-relaxed text-destructive-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Acceso bloqueado.</strong> Debes aceptar el Consentimiento
              Informado para ingresar a la aplicación.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rut" className="text-sm font-medium">
            RUT
          </label>
          <input
            id="rut"
            inputMode="text"
            autoComplete="username"
            placeholder="12.345.678-5"
            value={rut}
            onChange={(e) => setRut(formatRut(e.target.value))}
            maxLength={12}
            className={`${inputClass} font-mono`}
            aria-invalid={!!loginState.error}
            aria-describedby={loginState.error ? 'login-error' : undefined}
            disabled={loginState.loading}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="clave" className="text-sm font-medium">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="clave"
              type={showClave ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className={`${inputClass} pr-11`}
              aria-invalid={!!loginState.error}
              disabled={loginState.loading}
            />
            <button
              type="button"
              onClick={() => setShowClave((v) => !v)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              {showClave ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              <span className="sr-only">{showClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
            </button>
          </div>
        </div>

        {loginState.error && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive-soft p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <FieldError id="login-error">{loginState.error}</FieldError>
          </div>
        )}

        <button
          type="submit"
          disabled={loginState.loading || locked}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none disabled:opacity-60"
        >
          {loginState.loading ? (
            <>
              <Spinner /> Verificando credenciales…
            </>
          ) : locked ? (
            <>
              <Lock className="size-4" aria-hidden="true" /> Cuenta bloqueada (15 min)
            </>
          ) : (
            'Ingresar'
          )}
        </button>

        <div className="mt-auto flex flex-col gap-2 rounded-xl border border-dashed bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Dataset sintético de prueba</p>
          <ul className="flex flex-col gap-1 font-mono">
            <li>Funcionario · 12.345.678-5 · Cmq2026*</li>
            <li>RR. HH. · 15.678.432-K · Rrhh2026*</li>
            <li>Jefatura · 9.876.543-3 · Jefe2026*</li>
          </ul>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Acceso exclusivo con credenciales institucionales. Sin inicio de sesión con Google o Microsoft.
        </p>
      </form>

      <Modal
        open={consentOpen}
        onClose={rejectConsent}
        title="Consentimiento Informado y Privacidad"
        description="Lectura y aceptación obligatoria antes del primer ingreso · Versión 1.2"
        footer={
          <>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted p-3 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span>He leído y acepto los términos de uso</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={rejectConsent}
                className="h-11 flex-1 rounded-xl border text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={acceptConsent}
                disabled={!accepted}
                className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Aceptar
              </button>
            </div>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            La Corporación Municipal de Quilpué (CMQ), Área Salud, tratará tus datos personales y laborales conforme
            a la Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 21.719 de Protección de Datos Personales.
          </p>
          <h3 className="font-semibold text-foreground">1. Finalidad del tratamiento</h3>
          <p>
            Gestionar tu expediente laboral digital: contratos, licencias médicas, certificados de capacitación y
            permisos administrativos.
          </p>
          <h3 className="font-semibold text-foreground">2. Datos sensibles</h3>
          <p>
            Las licencias médicas se consideran datos sensibles. Su acceso está segmentado por perfil y queda
            registrado en el log de auditoría.
          </p>
          <h3 className="font-semibold text-foreground">3. Almacenamiento y seguridad</h3>
          <p>
            Los archivos se resguardan en el repositorio corporativo (SharePoint). En tu dispositivo, los datos
            temporales se cifran (SQLCipher + Android Keystore) y los documentos no se descargan a la memoria del
            teléfono.
          </p>
          <h3 className="font-semibold text-foreground">4. Tus derechos</h3>
          <p>
            Puedes solicitar acceso, rectificación o cancelación de tus datos a Recursos Humanos. Los cambios de
            nombre o RUT requieren documento probatorio.
          </p>
          <h3 className="font-semibold text-foreground">5. Notificaciones</h3>
          <p>
            Recibirás solo notificaciones locales con texto genérico, sin información sensible en la pantalla de
            bloqueo.
          </p>
        </div>
      </Modal>
    </div>
  )
}
