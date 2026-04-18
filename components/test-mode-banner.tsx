"use client"

export function TestModeBanner() {
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') return null
  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-[60]">
      <span className="mr-2">⚠️</span>
      MODO PRUEBA — Los pagos son simulados. No se cobra dinero real.
      <span className="mx-2">|</span>
      TEST MODE — Payments are simulated. No real money is charged.
    </div>
  )
}
