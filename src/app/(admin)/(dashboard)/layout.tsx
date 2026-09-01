'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Tag,
  Menu,
  X,
  Loader2,
  Shield
} from 'lucide-react';

interface UserSession {
  authenticated: boolean;
  user?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    artesao?: {
      id: string;
      slug: string;
      marca: string | null;
      foto: string | null;
    } | null;
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Validate session
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setSession(data);
      })
      .catch(() => {
        router.push('/admin/login');
      });

    // Load config
    fetch('/api/configuracao')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setConfig(data);
      })
      .catch(() => {});
  }, [router, pathname]);

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
        <Loader2 className="text-[#C15C3D] animate-spin" size={36} />
      </div>
    );
  }

  const { user } = session;
  const isAdmin = user?.tipo === 'ADMIN';

  const menuItems = [
    { name: 'Painel Geral', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Meu Perfil', href: '/admin/perfil', icon: User, hideForAdmin: false }, // Admins can edit their profile info
    { name: 'Gerenciar Produtos', href: '/admin/produtos', icon: ShoppingBag },
    { name: 'Etiquetas', href: '/admin/etiquetas', icon: Tag },
    { name: 'Controle de Vendas', href: '/admin/vendas', icon: TrendingUp },
    { name: 'Exportar PDF', href: '/admin/catalogo-pdf', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7] print:bg-white">
      {/* 1. Mobile top bar */}
      <header className="md:hidden flex items-center justify-between bg-[#2B2D2F] text-white px-6 py-4 z-40 border-b border-[#8D7F73]/20 print:hidden">
        <Link href="/" className="flex items-center gap-2">
          {config?.logoImagem && (
            <img
              src={config.logoImagem}
              alt="Logo"
              className="h-6 w-6 object-contain shrink-0"
            />
          )}
          <div className="flex flex-col">
            {config?.logoTextoImagem ? (
              <img
                src={config.logoTextoImagem}
                alt={config.logoTexto || 'FIOSA'}
                className="h-5 w-auto object-contain"
              />
            ) : (
              <span className="font-serif text-base font-bold tracking-widest">{config?.logoTexto || 'FIOSA'}</span>
            )}
            <span className="text-[7px] tracking-[0.2em] text-[#8D7F73] uppercase mt-0.5">PAINEL</span>
          </div>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white print:hidden">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* 2. Sidebar (hidden on mobile, visible on desktop) */}
      <aside className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-[#2B2D2F] text-[#F3EFE9] flex flex-col border-r border-[#8D7F73]/30 transition-transform duration-300 md:translate-x-0 print:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#8D7F73]/20 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2.5 mb-4 justify-center">
            {config?.logoImagem && (
              <img
                src={config.logoImagem}
                alt="Logo"
                className="h-8 w-8 object-contain shrink-0"
              />
            )}
            <div className="flex flex-col text-left">
              {config?.logoTextoImagem ? (
                <img
                  src={config.logoTextoImagem}
                  alt={config.logoTexto || 'FIOSA'}
                  className="h-5 sm:h-6 w-auto object-contain"
                />
              ) : (
                <span className="font-serif text-xl font-bold tracking-widest text-[#FDFBF7]">{config?.logoTexto || 'FIOSA'}</span>
              )}
              <span className="text-[8px] tracking-[0.2em] text-[#8D7F73] uppercase mt-0.5">ADMINISTRAÇÃO</span>
            </div>
          </Link>
          
          {/* Active Artisan Avatar */}
          <div className="relative h-16 w-16 rounded-full overflow-hidden border border-[#8D7F73]/40 bg-[#F3EFE9] mb-2 shadow-inner">
            {user?.artesao?.foto ? (
              <img
                src={user.artesao.foto}
                alt={user.nome}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#2B2D2F]">
                <User size={24} />
              </div>
            )}
          </div>
          <span className="font-serif text-sm font-bold text-[#FDFBF7]">{user?.nome}</span>
          <span className="font-sans text-[9px] text-[#8D7F73] font-bold uppercase tracking-wider">
            {isAdmin ? 'Superadministrador' : user?.artesao?.marca || 'Artesão'}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-sans font-bold tracking-wider transition-colors ${
                  pathname === item.href
                    ? 'bg-[#C15C3D] text-white'
                    : 'hover:bg-[#F3EFE9]/10 text-[#F3EFE9]/85'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}

          {/* Superadmin specific sections */}
          {isAdmin && (
            <div className="pt-4 border-t border-[#8D7F73]/20 mt-4 space-y-1">
              <span className="block px-4 pb-2 text-[9px] font-sans font-bold text-[#8D7F73] uppercase tracking-wider">
                Ferramentas FIOSA
              </span>
              <Link
                href="/admin/fiosa"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-sans font-bold tracking-wider transition-colors ${
                  pathname.startsWith('/admin/fiosa')
                    ? 'bg-[#606C38] text-white'
                    : 'hover:bg-[#F3EFE9]/10 text-[#F3EFE9]/85'
                }`}
              >
                <Shield size={16} />
                Gerenciar FIOSA
              </Link>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#8D7F73]/20 flex flex-col gap-2 bg-[#232426]">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full border border-[#8D7F73]/30 hover:bg-[#FDFBF7]/5 text-xs py-2 rounded font-sans tracking-wide transition-all"
          >
            <ExternalLink size={14} />
            Visualizar Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white font-sans text-xs font-bold uppercase py-2.5 rounded transition-colors"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 md:hidden print:hidden"
        />
      )}

      {/* 3. Main Workspace panel */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto print:p-0 print:max-w-none print:overflow-visible">
        {children}
      </main>
    </div>
  );
}
