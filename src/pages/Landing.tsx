import React from 'react'
import PreviewCard from "@/ui/PreviewCard";
export default function Landing(){
  return (
    <div className="max-w-6xl mx-auto p-8">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Previsibilidade financeiramente real — para pessoa e empresa</h1>
          <p className="mt-4 text-slate-700">Painel que consolida negócios, roda simulações de fluxo de caixa, gera DRE simplificado e ajuda a tomar decisões com previsões com intervalos de confiança.</p>
          <div className="mt-6 flex gap-4">
            <a href="/signup" className="px-6 py-3 bg-indigo-600 text-white rounded shadow">Comece grátis</a>
            <a href="#features" className="px-6 py-3 border rounded">Ver funcionalidades</a>
          </div>
          <ul id="features" className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li className="p-4 bg-white rounded shadow">Multi-business por conta</li>
            <li className="p-4 bg-white rounded shadow">Importação CSV/OFX</li>
            <li className="p-4 bg-white rounded shadow">Forecasts e cenários</li>
            <li className="p-4 bg-white rounded shadow">Cobrança via Stripe</li>
          </ul>
        </div>

        <div>
          <PreviewCard />
        </div>
      </section>

      <section className="mt-12 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold">Como funciona — rápido</h2>
        <ol className="mt-4 text-left list-decimal list-inside space-y-2">
          <li>Crie sua conta e adicione um ou mais negócios na mesma conta.</li>
          <li>Importe extratos (CSV/OFX) e categorize automaticamente.</li>
          <li>Rode previsões (3/6/12 meses), ajuste assumptions e salve cenários.</li>
          <li>Use relatórios para planejar cortes, investimentos e metas.</li>
        </ol>
      </section>
    </div>
  )
}
