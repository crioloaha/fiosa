'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Eye,
  MessageSquare,
  DollarSign,
  Plus,
  User,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Product {
  id: string;
  nome: string;
  status: string;
  visualizacoes: number;
}

interface Sale {
  id: string;
  quantidade: number;
  valorVenda: number;
  custoTotal: number;
  contribuicaoFiosa: number;
  dataVenda: string;
  produto: {
    nome: string;
  };
}

interface UserSession {
  authenticated: boolean;
  user: {
    id: string;
    nome: string;
    tipo: string;
    artesao: {
      id: string;
      slug: string;
      marca: string | null;
      foto: string | null;
    } | null;
  };
}

interface ArtisanStats {
  id: string;
  visualizacoesPerfil: number;
  cliquesWhats: number;
  nome: string;
}

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [artesaoDetails, setArtesaoDetails] = useState<ArtisanStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current session and details
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((sessionData) => {
        if (sessionData.authenticated) {
          setSession(sessionData);
          
          const artesaoId = sessionData.user.artesao?.id;
          const artesaoSlug = sessionData.user.artesao?.slug;

          if (artesaoId && artesaoSlug) {
            // Load artisan profile views & clicks
            fetch(`/api/artesao/${artesaoSlug}`)
              .then((res) => res.json())
              .then((artesaoData) => setArtesaoDetails(artesaoData));

            // Load products
            fetch('/api/produtos?admin=true')
              .then((res) => res.json())
              .then((prodData) => {
                if (Array.isArray(prodData)) setProducts(prodData);
              });

            // Load sales
            fetch('/api/vendas')
              .then((res) => res.json())
              .then((salesData) => {
                if (Array.isArray(salesData)) setSales(salesData);
              });
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro no Dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="text-[#C15C3D] animate-spin" size={36} />
      </div>
    );
  }

  const { user } = session;

  // If superadmin has no artisan linked, prompt to manage FIOSA
  if (user.tipo === 'ADMIN' && !user.artesao) {
    return (
      <div className="space-y-6">
        <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 p-8 rounded-xl space-y-4">
          <h1 className="font-serif text-3xl text-[#2B2D2F]">Bem-vindo, Administrador!</h1>
          <p className="font-sans text-sm text-[#2B2D2F]/70 leading-relaxed">
            Você está logado como Administrador Geral da FIOSA. Esta conta permite gerenciar a plataforma, cadastrar artesãos, moderar produtos e definir categorias.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/fiosa"
              className="inline-flex items-center gap-2 bg-[#606C38] hover:bg-[#606C38]/90 text-white font-sans font-bold text-xs tracking-wider px-6 py-3 rounded uppercase transition-colors"
            >
              Ir para o Gerenciamento FIOSA
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calc Summary Counters
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'PUBLICADO').length;
  const draftProducts = products.filter((p) => p.status === 'RASCUNHO').length;
  const profileViews = artesaoDetails?.visualizacoesPerfil || 0;
  const productViews = products.reduce((acc, p) => acc + p.visualizacoes, 0);
  const whatsAppClicks = artesaoDetails?.cliquesWhats || 0;

  // Calc Financial Statistics
  const totalGrossRevenue = sales.reduce((acc, s) => acc + s.valorVenda, 0);
  const totalCVM = sales.reduce((acc, s) => acc + s.custoTotal, 0);
  const totalFiosaContribution = sales.reduce((acc, s) => acc + s.contribuicaoFiosa, 0);
  const totalNetProfit = totalGrossRevenue - totalCVM - totalFiosaContribution;

  // Chart Data preparation (grouped by Month of sale)
  const chartDataMap: { [key: string]: { mes: string; Vendas: number; Contribuição: number } } = {};
  sales.forEach((s) => {
    const d = new Date(s.dataVenda);
    const monthYear = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    if (!chartDataMap[monthYear]) {
      chartDataMap[monthYear] = { mes: monthYear, Vendas: 0, Contribuição: 0 };
    }
    chartDataMap[monthYear].Vendas += s.valorVenda;
    chartDataMap[monthYear].Contribuição += s.contribuicaoFiosa;
  });

  const chartData = Object.values(chartDataMap).reverse();

  // If no sales yet, add a default placeholder month
  if (chartData.length === 0) {
    chartData.push({ mes: 'Sem vendas', Vendas: 0, Contribuição: 0 });
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2D2F]">
            Olá, {user.nome}!
          </h1>
          <p className="font-sans text-xs text-[#2B2D2F]/50 mt-1 font-semibold uppercase tracking-wider">
            Seu catálogo está atualizado?
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link
            href="/admin/produtos?action=new"
            className="flex-grow md:flex-grow-0 inline-flex items-center justify-center gap-1.5 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2.5 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus size={14} />
            Adicionar Produto
          </Link>
          <Link
            href="/admin/perfil"
            className="inline-flex items-center justify-center gap-1.5 border border-[#8D7F73]/30 hover:bg-[#F3EFE9] text-[#2B2D2F] px-4 py-2.5 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <User size={14} />
            Editar Perfil
          </Link>
          {user.artesao && (
            <Link
              href={`/artesao/${user.artesao.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center border border-[#8D7F73]/30 hover:bg-[#F3EFE9] text-[#2B2D2F] p-2.5 rounded transition-colors"
              title="Ver meu catálogo público"
            >
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Numerical Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-5 rounded-xl text-center space-y-1">
          <ShoppingBag className="text-[#C15C3D] mx-auto mb-1" size={20} />
          <span className="block font-sans text-[10px] font-bold text-[#2B2D2F]/40 uppercase tracking-wider">Produtos Cadastrados</span>
          <span className="font-sans text-xl font-extrabold text-[#2B2D2F]">{totalProducts}</span>
          <span className="block font-sans text-[9px] text-[#2B2D2F]/50">
            {publishedProducts} publicados | {draftProducts} rascunhos
          </span>
        </div>

        <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-5 rounded-xl text-center space-y-1">
          <Eye className="text-[#606C38] mx-auto mb-1" size={20} />
          <span className="block font-sans text-[10px] font-bold text-[#2B2D2F]/40 uppercase tracking-wider">Visualizações de Perfil</span>
          <span className="font-sans text-xl font-extrabold text-[#2B2D2F]">{profileViews}</span>
          <span className="block font-sans text-[9px] text-[#2B2D2F]/50">Cliques no perfil</span>
        </div>

        <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-5 rounded-xl text-center space-y-1">
          <Eye className="text-[#C15C3D] mx-auto mb-1" size={20} />
          <span className="block font-sans text-[10px] font-bold text-[#2B2D2F]/40 uppercase tracking-wider">Visualizações de Peças</span>
          <span className="font-sans text-xl font-extrabold text-[#2B2D2F]">{productViews}</span>
          <span className="block font-sans text-[9px] text-[#2B2D2F]/50">Total em todas as peças</span>
        </div>

        <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-5 rounded-xl text-center space-y-1">
          <MessageSquare className="text-[#606C38] mx-auto mb-1" size={20} />
          <span className="block font-sans text-[10px] font-bold text-[#2B2D2F]/40 uppercase tracking-wider">Cliques no WhatsApp</span>
          <span className="font-sans text-xl font-extrabold text-[#2B2D2F]">{whatsAppClicks}</span>
          <span className="block font-sans text-[9px] text-[#2B2D2F]/50">Contatos de venda iniciados</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#606C38] text-white p-5 rounded-xl text-center flex flex-col justify-center space-y-1">
          <TrendingUp className="text-[#FDFBF7] mx-auto mb-1" size={20} />
          <span className="block font-sans text-[10px] font-bold text-[#FDFBF7]/60 uppercase tracking-wider">Vendas Totais</span>
          <span className="font-sans text-xl font-extrabold text-[#FDFBF7]">{sales.length}</span>
          <span className="block font-sans text-[9px] text-[#FDFBF7]/60">Registros manuais</span>
        </div>
      </div>

      {/* Financial Performance Section */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2 flex items-center gap-2">
          <DollarSign size={18} className="text-[#C15C3D]" />
          Desempenho Financeiro
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Gross revenue */}
          <div className="bg-[#FDFBF7] border border-[#8D7F73]/15 p-6 rounded-xl space-y-1 shadow-sm">
            <span className="block font-sans text-[9px] font-bold text-[#2B2D2F]/50 uppercase tracking-wider">Faturamento Bruto</span>
            <p className="font-sans text-2xl font-extrabold text-[#2B2D2F]">
              R$ {totalGrossRevenue.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] font-sans text-[#2B2D2F]/40 leading-relaxed">
              Valor bruto arrecadado com as vendas.
            </p>
          </div>

          {/* CVM total cost */}
          <div className="bg-[#FDFBF7] border border-[#8D7F73]/15 p-6 rounded-xl space-y-1 shadow-sm">
            <span className="block font-sans text-[9px] font-bold text-[#2B2D2F]/50 uppercase tracking-wider">Custo dos Produtos (CVM)</span>
            <p className="font-sans text-2xl font-extrabold text-[#2B2D2F]">
              R$ {totalCVM.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] font-sans text-[#2B2D2F]/40 leading-relaxed">
              Custo total de fabricação (matéria-prima + tempo).
            </p>
          </div>

          {/* FIOSA Contribution */}
          <div className="bg-[#FDFBF7] border border-[#8D7F73]/15 p-6 rounded-xl space-y-1 shadow-sm border-l-4 border-l-[#C15C3D]">
            <span className="block font-sans text-[9px] font-bold text-[#C15C3D] uppercase tracking-wider">Contribuição FIOSA</span>
            <p className="font-sans text-2xl font-extrabold text-[#C15C3D]">
              R$ {totalFiosaContribution.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] font-sans text-[#2B2D2F]/40 leading-relaxed">
              Comissão retida para custeio do projeto colaborativo.
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-[#FDFBF7] border border-[#8D7F73]/15 p-6 rounded-xl space-y-1 shadow-sm border-l-4 border-l-[#606C38]">
            <span className="block font-sans text-[9px] font-bold text-[#606C38] uppercase tracking-wider">Lucro Líquido Estimado</span>
            <p className="font-sans text-2xl font-extrabold text-[#606C38]">
              R$ {totalNetProfit.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] font-sans text-[#2B2D2F]/40 leading-relaxed">
              Lucro líquido após dedução do CVM e contribuição.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Chart vs Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Chart */}
        <div className="lg:col-span-7 bg-[#FDFBF7] border border-[#8D7F73]/15 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2">
            Vendas e Contribuição por Mês
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                <Tooltip formatter={(value) => `R$ ${parseFloat(String(value ?? 0)).toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                <Bar dataKey="Vendas" fill="#606C38" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Contribuição" fill="#C15C3D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent sales registered */}
        <div className="lg:col-span-5 bg-[#FDFBF7] border border-[#8D7F73]/15 p-6 rounded-xl shadow-sm space-y-4 flex flex-col h-full">
          <div className="flex justify-between items-baseline border-b border-[#8D7F73]/20 pb-2">
            <h3 className="font-serif text-base font-bold text-[#2B2D2F]">
              Vendas Recentes
            </h3>
            <Link
              href="/admin/vendas"
              className="text-[10px] font-sans font-bold text-[#C15C3D] hover:underline uppercase tracking-wider"
            >
              VER TODAS
            </Link>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-3 pr-1 max-h-64">
            {sales.length > 0 ? (
              sales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center bg-[#F3EFE9] p-3 rounded border border-[#8D7F73]/10"
                >
                  <div className="space-y-0.5">
                    <span className="block font-sans text-xs font-bold text-[#2B2D2F] line-clamp-1">
                      {sale.produto.nome}
                    </span>
                    <span className="block font-sans text-[10px] text-[#2B2D2F]/50">
                      Qtd: <strong>{sale.quantidade}</strong> |{' '}
                      {new Date(sale.dataVenda).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-sans text-xs font-extrabold text-[#606C38]">
                      R$ {sale.valorVenda.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="block font-sans text-[9px] text-[#C15C3D] font-bold uppercase">
                      -{sale.contribuicaoFiosa.toFixed(2).replace('.', ',')} fiosa
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6 bg-[#F3EFE9] rounded">
                <p className="font-sans text-xs text-[#2B2D2F]/50 italic">
                  Nenhuma venda registrada ainda.<br />
                  <Link href="/admin/vendas" className="text-[#C15C3D] font-bold not-italic hover:underline">
                    Registrar primeira venda
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
