import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/mockServer'

function BusinessSwitcher({ businesses, onSelect }:{ businesses:any[]; onSelect:(id:string)=>void }){
  return (
    <div className="flex gap-2">
      {businesses.map(b=>(
        <button key={b.id} onClick={()=>onSelect(b.id)} className="px-3 py-1 bg-slate-100 rounded">{b.name}</button>
      ))}
    </div>
  )
}

function KPI({ label, value }:{ label:string; value:string|number }){
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

export default function Dashboard(){
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [businessData, setBusinessData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{ api.listBusinesses().then(setBusinesses) },[])

  useEffect(()=>{
    if (businesses.length && !selected) setSelected(businesses[0].id)
  },[businesses])

  useEffect(()=>{
    if (!selected) return
    let mounted = true
    setLoading(true)
    api.getBusiness(selected).then(b=>{
      if (mounted) setBusinessData(b)
    }).finally(()=>setLoading(false))
    return ()=>{ mounted = false }
  },[selected])

  async function addTransaction(){
    if (!selected) return
    const amount = prompt('Amount (positive for income, negative for expense)')
    if (!amount) return
    await api.addTransaction(selected, { date: new Date().toISOString().slice(0,10), amount: Number(amount), type: Number(amount)>0 ? 'credit' : 'debit', description: 'Manual' })
    const b = await api.getBusiness(selected)
    setBusinessData(b)
  }

  async function runForecast(){
    if (!selected) return
    const res = await api.runForecast(selected, 6, 0.03)
    alert('Forecast gerado (ver console)')
    console.log('forecast', res)
    // in a real app, show nice chart / save scenario
  }

  if (!businesses.length) return <div className="p-8">Nenhum negócio configurado. <Link to="/signup" className="text-indigo-600">Criar conta</Link></div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <BusinessSwitcher businesses={businesses} onSelect={setSelected} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI label="Saldo atual (simulado)" value={(businessData?.transactions || []).reduce((s:any,t:any)=>s+Number(t.amount),0)} />
        <KPI label="Receita MTD" value={'$' + ((businessData?.transactions||[]).filter((t:any)=>t.amount>0).reduce((s:any,t:any)=>s+Number(t.amount),0))} />
        <KPI label="Despesa MTD" value={'$' + ((businessData?.transactions||[]).filter((t:any)=>t.amount<0).reduce((s:any,t:any)=>s+Number(t.amount),0))} />
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Transações</h3>
            <div className="space-x-2">
              <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={addTransaction}>Adicionar</button>
              <button className="px-3 py-1 border rounded" onClick={()=>navigate('/app/transactions')}>Ver todas</button>
            </div>
          </div>

          <table className="w-full mt-4">
            <thead className="text-left text-slate-500 text-sm">
              <tr><th>Data</th><th>Descrição</th><th>Valor</th></tr>
            </thead>
            <tbody>
              {businessData?.transactions?.slice().reverse().slice(0,6).map((t:any)=>(<tr key={t.id} className="border-t"><td className="py-2 text-sm">{t.date}</td><td className="py-2 text-sm">{t.description}</td><td className="py-2 text-sm">{t.amount}</td></tr>))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Forecast (rápido)</h3>
            <div className="space-x-2">
              <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={runForecast}>Rodar Forecast</button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-600">Esse forecast é um demo. Substitua pelo serviço real (ETS/ARIMA) no backend.</p>
            <div className="mt-4 h-40 bg-slate-50 rounded flex items-center justify-center text-slate-400">Gráfico demo (implemente chart real)</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Ações</h3>
        <div className="mt-2 flex gap-2">
          <button onClick={()=>alert('Salvar cenário (placeholder)')} className="px-3 py-1 border rounded">Salvar cenário</button>
          <button onClick={()=>alert('Export CSV (placeholder)')} className="px-3 py-1 border rounded">Export CSV</button>
        </div>
      </div>
    </div>
  )
}
