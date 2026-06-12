'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        toast.error('Senha incorreta')
      }
    } catch {
      toast.error('Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-clara-fundo">
      <div className="bg-white rounded-card shadow-card p-8 w-full max-w-sm">
        <h1 className="font-display text-3xl text-clara-rosa text-center mb-6">By Clara</h1>
        <h2 className="font-body font-semibold text-clara-texto text-center mb-6">
          Área Administrativa
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border-2 border-gray-200 rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-clara-rosa"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-clara-rosa text-white font-semibold rounded-2xl px-6 py-3 hover:brightness-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
