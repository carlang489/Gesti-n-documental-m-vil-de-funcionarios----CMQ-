import { CmqProvider } from '@/components/cmq/store'
import { PhoneShell } from '@/components/cmq/phone-shell'
import { EvaluatorPanel } from '@/components/cmq/evaluator-panel'

export default function Page() {
  return (
    <CmqProvider>
      <div className="flex min-h-dvh flex-col-reverse md:flex-row">
        <EvaluatorPanel />
        <div className="flex flex-1 items-center justify-center sm:p-6">
          <PhoneShell />
        </div>
      </div>
    </CmqProvider>
  )
}
