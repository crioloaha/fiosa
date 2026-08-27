'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';

interface UserSession {
  authenticated: boolean;
  user?: {
    nome: string;
    tipo: string;
  };
}

export default function Header({ config }: { config: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check session
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, [pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: 'FIOSA', href: '/#a-fiosa' },
    { name: 'ARTESÃOS', href: '/artesaos' },
    { name: 'PRODUTOS', href: '/produtos' },
    { name: 'EXPERIÊNCIAS', href: '/experiencias' },
    { name: 'VISITE RESENDE COSTA', href: '/visite-resende-costa' },
    { name: 'CONTATO', href: '/contato' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-fiosa-cru/90 backdrop-blur-md border-b border-fiosa-marrom/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            {(() => {
              const hasSubtitle = !!(config?.logoSubtitulo && config.logoSubtitulo.trim() !== '');
              return (
                <Link href="/" className="flex items-center gap-3">
                  {config?.logoImagem && (
                    <img
                      src={config.logoImagem}
                      alt="Marca FIOSA"
                      className={`object-contain shrink-0 transition-all duration-300 ${
                        hasSubtitle ? 'h-10 w-10 md:h-12 md:w-12' : 'h-11 w-11 md:h-14 md:w-14'
                      }`}
                    />
                  )}
                  <div className="flex flex-col justify-center">
                    {config?.logoTextoImagem ? (
                      <img
                        src={config.logoTextoImagem}
                        alt={config.logoTexto || 'FIOSA'}
                        className={`w-auto object-contain transition-all duration-300 ${
                          hasSubtitle ? 'h-6 sm:h-8' : 'h-7 sm:h-9'
                        }`}
                      />
                    ) : (
                      <span
                        className={`font-serif font-bold tracking-widest text-fiosa-grafite leading-none transition-all duration-300 ${
                          hasSubtitle ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                        }`}
                      >
                        {config?.logoTexto || 'FIOSA'}
                      </span>
                    )}
                    {/* Subtítulo com espaçamento refinado */}
                    {hasSubtitle && (
                      <div className="mt-0.5 flex flex-col font-sans text-fiosa-marrom uppercase leading-tight">
                        {(() => {
                          const sub = config.logoSubtitulo;
                          const parts = sub.split(/ARTESÃOS /);
                          if (parts.length === 2) {
                            return (
                              <>
                                <span className="text-[8px] tracking-[0.13em]">{parts[0]}ARTESÃOS</span>
                                <span className="text-[9px] tracking-[0.42em]">{parts[1]}</span>
                              </>
                            );
                          }
                          return <span className="text-[8px] tracking-[0.13em]">{sub}</span>;
                        })()}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })()}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-sans text-xs tracking-wider font-semibold transition-colors duration-200 ${
                  pathname === item.href.split('#')[0]
                    ? 'text-fiosa-terracota'
                    : 'text-fiosa-grafite/80 hover:text-fiosa-terracota'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Auth Indicator */}
            {session?.authenticated ? (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 bg-fiosa-oliva text-fiosa-cru hover:bg-fiosa-oliva/90 px-4 py-2 rounded font-sans text-xs tracking-wider font-bold transition-all"
              >
                <User size={14} />
                PAINEL
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 border border-fiosa-marrom/40 text-fiosa-grafite hover:bg-fiosa-linho px-4 py-2 rounded font-sans text-xs tracking-wider font-bold transition-all"
              >
                ENTRAR
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              type="button"
              className="text-fiosa-grafite hover:text-fiosa-terracota focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-fiosa-cru border-b border-fiosa-marrom/20 shadow-lg transition-all duration-300">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md font-sans text-sm font-bold tracking-wide ${
                  pathname === item.href.split('#')[0]
                    ? 'text-fiosa-terracota bg-fiosa-linho'
                    : 'text-fiosa-grafite/80 hover:text-fiosa-terracota hover:bg-fiosa-linho'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-fiosa-marrom/20">
              {session?.authenticated ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center flex items-center justify-center gap-2 bg-fiosa-oliva text-fiosa-cru hover:bg-fiosa-oliva/90 px-4 py-3 rounded-md font-sans text-xs tracking-wider font-bold transition-all"
                >
                  <User size={14} />
                  ACESSAR PAINEL ADMINISTRATIVO
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center flex items-center justify-center gap-2 bg-fiosa-terracota text-fiosa-cru hover:bg-fiosa-terracota/90 px-4 py-3 rounded-md font-sans text-xs tracking-wider font-bold transition-all"
                >
                  ENTRAR COMO ARTESÃO
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Handwoven cotton fringe detail */}
      <div className="franja-horizontal" />
    </header>
  );
}
