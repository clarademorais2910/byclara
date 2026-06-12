'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Image, LogOut, Menu, X, Settings } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/admin/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/pedidos',       label: 'Pedidos',       icon: ShoppingBag     },
  { href: '/admin/produtos',      label: 'Produtos',      icon: Package         },
  { href: '/admin/banners',       label: 'Banners',       icon: Image           },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings        },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 shadow-soft fixed inset-y-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="font-display text-2xl text-clara-rosa">By Clara</Link>
          <p className="text-xs text-gray-400 mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-clara-rosa/10 text-clara-rosa'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-100 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(v => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="font-display text-xl text-clara-rosa">By Clara Admin</span>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setOpen(false)}>
          <aside className="w-56 bg-white h-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 pt-16 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    pathname.startsWith(href) ? 'bg-clara-rosa/10 text-clara-rosa' : 'text-gray-500'
                  }`}
                >
                  <Icon size={18} />{label}
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-gray-400">
                <LogOut size={18} /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 p-6">
        {children}
      </main>
    </div>
  )
}
