import React from 'react'
export default function PreviewCard(){
  return (
    <div className="bg-gradient-to-br from-slate-800 to-indigo-900 text-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Preview do Dashboard</h3>
          <p className="text-slate-200 text-sm mt-1">Imagem temporária — substitua pela screenshot real do produto.</p>
        </div>
        <div className="text-sm text-slate-300">Beta</div>
      </div>

      <div className="mt-4 border rounded overflow-hidden bg-white">
        {/* placeholder image: troque pelo seu arquivo: /assets/preview.png */}
        <img src="assets/PreviewDashboard.pn" alt="preview" className="w-full h-auto block" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-black">
        <div className="p-2 bg-slate-100 rounded">Saldo: $4,800</div>
        <div className="p-2 bg-slate-100 rounded">Fluxo MTD: +$2,200</div>
        <div className="p-2 bg-slate-100 rounded">Forecast 6m: +10%</div>
      </div>
    </div>
  )
}
