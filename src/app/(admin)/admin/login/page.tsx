'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [config, setConfig] = useState<any>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          router.push('/admin/dashboard');
        }
      });

    fetch('/api/configuracao')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setConfig(data);
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar.');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#FDFBF7] py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-[#2B2D2F]/60 hover:text-[#C15C3D] transition-colors"
        >
          <ArrowLeft size={14} />
          VOLTAR PARA A LOJA
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 flex flex-col items-center">
        {config?.logoImagem && (
          <img
            src={config.logoImagem}
            alt="Logo"
            className="h-12 w-12 object-contain mb-2 shrink-0"
          />
        )}
        {config?.logoTextoImagem ? (
          <img
            src={config.logoTextoImagem}
            alt={config.logoTexto || 'FIOSA'}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span className="font-serif text-4xl font-bold tracking-widest text-[#2B2D2F]">
            {config?.logoTexto || 'FIOSA'}
          </span>
        )}
        <h2 className="font-serif text-xl font-medium text-[#8D7F73] uppercase tracking-wider pt-2">
          Área Administrativa
        </h2>
        <p className="font-sans text-xs text-[#2B2D2F]/50">
          Acesse para gerenciar seu perfil, catálogo e vendas.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F3EFE9] py-8 px-4 border border-[#8D7F73]/20 shadow sm:rounded-xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error message */}
            {error && (
              <div className="bg-[#C15C3D]/10 border-l-4 border-[#C15C3D] p-3 text-xs text-[#C15C3D] font-sans font-semibold rounded">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Endereço de E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2B2D2F]/40">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="artesao@fiosa.com.br"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <label htmlFor="password" className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2B2D2F]/40">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="Sua senha secreta"
                />
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white py-3 rounded font-sans font-bold text-xs tracking-wider uppercase transition-colors shadow-sm disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    ENTRANDO...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
