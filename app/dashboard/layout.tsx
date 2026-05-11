'use client'

import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard',            icon: '📊', label: 'Início' },
  { href: '/dashboard/membros',    icon: '👥', label: 'Membros' },
  { href: '/dashboard/hospitais',  icon: '🏥', label: 'Hospitais' },
  { href: '/dashboard/escalas',    icon: '📅', label: 'Escalas' },
  { href: '/dashboard/registros',  icon: '📋', label: 'Registros' },
  { href: '/dashboard/relatorios', icon: '📈', label: 'Relatórios' },
]

function NavLink({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  if (active) {
    return (
      <a href={href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">
        {icon} {label}
      </a>
    )
  }
  return (
    <a href={href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
      {icon} {label}
    </a>
  )
}

function BottomNavLink({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  if (active) {
    return (
      <a href={href} className="flex flex-col items-center gap-0.5 px-1 py-1 text-blue-600 font-semibold" style={{minWidth: 0}}>
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] truncate w-full text-center">{label}</span>
      </a>
    )
  }
  return (
    <a href={href} className="flex flex-col items-center gap-0.5 px-1 py-1 text-gray-500" style={{minWidth: 0}}>
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] truncate w-full text-center">{label}</span>
    </a>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-white shadow-md flex-col shrink-0">
        <div className="px-6 py-5 border-b">
          <p className="text-xs text-gray-400 uppercase tracking-wider">DARPE</p>
          <h1 className="text-lg font-bold text-gray-800">Setor 4 — Hospitais</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </nav>
        <div className="px-4 py-4 border-t">
          <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm">
            🚪 Sair
          </a>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col">

        {/* Header mobile */}
        <header className="md:hidden bg-white shadow px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">DARPE</p>
            <h1 className="text-base font-bold text-gray-800">Setor 4 — Hospitais</h1>
          </div>
          <a href="/" className="text-red-500 text-sm">🚪 Sair</a>
        </header>

        {/* Página */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>

        {/* Bottom nav mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
          <div className="flex justify-around items-center py-1 px-1">
            {navItems.map(item => (
              <BottomNavLink key={item.href} {...item} active={pathname === item.href} />
            ))}
          </div>
        </nav>

      </div>
    </div>
  )
}