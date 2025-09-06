import React, { useState } from 'react'
import { api } from '../api/mockServer'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }:{ onLogin?: (user:any)=>void }){
  const [email, setEmail] = useState('demo@demo.com'), [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function submit(e:any){
    e.preventDefault()
    setLoading(true); setError(null)
    try{
      const r = await api.login(email, password)
      onLogin?.({ user: r.user })
      navigate('/app')
    }catch(err:any){
      setError(err.message || 'Erro')
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-semibold">Entrar</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="w-full p-3 border rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-3 border rounded" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="w-full bg-indigo-600 text-white py-3 rounded" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <div className="mt-4 text-sm text-slate-600">Sem conta? <a href="/signup" className="text-indigo-600">Criar agora</a></div>
      <div className="mt-4 text-sm text-slate-500">Demo: demo@demo.com / demo123</div>
    </div>
  )
}
