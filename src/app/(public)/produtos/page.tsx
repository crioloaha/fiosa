'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, Loader2, ArrowUpDown } from 'lucide-react';

interface Category {
  id: string;
  nome: string;
  slug: string;
}

interface Artisan {
  id: string;
  nome: string;
  slug: string;
}

interface Product {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number | null;
  fotos: string;
  materiais: string | null;
  tecnica: string | null;
  dimensoes: string | null;
  disponibilidade: string;
  artesao: {
    id: string;
    nome: string;
    slug: string;
    mostrarPreco: boolean;
  };
  categoria: {
    id: string;
    nome: string;
    slug: string;
  };
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedArtisan, setSelectedArtisan] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      fetch('/api/produtos').then((res) => res.json()),
      fetch('/api/categorias').then((res) => res.json()),
      fetch('/api/artesao').then((res) => res.json()),
    ])
      .then(([productsData, categoriesData, artisansData]) => {
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (Array.isArray(artisansData)) setArtisans(artisansData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar dados do catálogo:', err);
        setLoading(false);
      });
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...products];

    // Search query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.descricao?.toLowerCase().includes(q) ||
          p.artesao.nome.toLowerCase().includes(q) ||
          p.categoria.nome.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.categoria.slug === selectedCategory);
    }

    // Artisan
    if (selectedArtisan !== 'ALL') {
      result = result.filter((p) => p.artesao.slug === selectedArtisan);
    }

    // Price range
    if (minPrice !== '') {
      const minVal = parseFloat(minPrice);
      result = result.filter((p) => p.preco !== null && p.preco >= minVal);
    }
    if (maxPrice !== '') {
      const maxVal = parseFloat(maxPrice);
      result = result.filter((p) => p.preco !== null && p.preco <= maxVal);
    }

    // Technique
    if (selectedTechnique !== 'ALL') {
      const techLower = selectedTechnique.toLowerCase();
      result = result.filter((p) => p.tecnica?.toLowerCase().includes(techLower));
    }

    // Availability
    if (selectedAvailability !== 'ALL') {
      result = result.filter((p) => p.disponibilidade === selectedAvailability);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.preco || 0) - (b.preco || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.preco || 0) - (a.preco || 0));
    } else {
      // default: newest/none (Prisma returns descending by date)
    }

    setFilteredProducts(result);
  }, [
    search,
    selectedCategory,
    selectedArtisan,
    minPrice,
    maxPrice,
    selectedTechnique,
    selectedAvailability,
    sortBy,
    products,
  ]);

  // Unique techniques for filtering (derived from products)
  const techniques = ['Tear Manual', 'Tear de Pente', 'Tear de Pedal', 'Crochê', 'Bordado'];

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setSelectedArtisan('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSelectedTechnique('ALL');
    setSelectedAvailability('ALL');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-[#606C38] uppercase bg-[#606C38]/10 px-3 py-1 rounded-full">
          Nossa Vitrine
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2B2D2F]">
          Catálogo de Produtos
        </h1>
        <p className="font-sans text-sm text-[#2B2D2F]/70 leading-relaxed">
          Navegue pelas peças tecidas e confeccionadas pelos nossos artesãos colaborativos. Encontre mantas, tapetes, bolsas, caminhos de mesa e muito mais.
        </p>
      </div>

      {/* Main Grid: Filters + List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block bg-[#F3EFE9] border border-[#8D7F73]/20 p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-[#8D7F73]/20 pb-4">
            <h2 className="font-serif text-lg font-bold text-[#2B2D2F]">Filtros</h2>
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-sans font-bold tracking-wider text-fiosa-terracota hover:underline"
            >
              LIMPAR TODOS
            </button>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-[#2B2D2F]/70 uppercase tracking-wider">Busca</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-[#2B2D2F]/40" size={16} />
              <input
                type="text"
                placeholder="Nome, material, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-[#2B2D2F]/70 uppercase tracking-wider">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
            >
              <option value="ALL">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Artisan */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-[#2B2D2F]/70 uppercase tracking-wider">Artesão</label>
            <select
              value={selectedArtisan}
              onChange={(e) => setSelectedArtisan(e.target.value)}
              className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
            >
              <option value="ALL">Todos os Artesãos</option>
              {artisans.map((a) => (
                <option key={a.id} value={a.slug}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-[#2B2D2F]/70 uppercase tracking-wider">Faixa de Preço</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min R$"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
              />
              <input
                type="number"
                placeholder="Max R$"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
              />
            </div>
          </div>

          {/* Technique */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-[#2B2D2F]/70 uppercase tracking-wider">Técnica</label>
            <select
              value={selectedTechnique}
              onChange={(e) => setSelectedTechnique(e.target.value)}
              className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
            >
              <option value="ALL">Todas as Técnicas</option>
              {techniques.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-[#2B2D2F]/70 uppercase tracking-wider">Disponibilidade</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
            >
              <option value="ALL">Qualquer status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="SOB_ENCOMENDA">Sob Encomenda</option>
              <option value="ESGOTADO">Esgotado</option>
            </select>
          </div>
        </aside>

        {/* Catalog List section */}
        <section className="lg:col-span-3 space-y-6">
          {/* Controls: sorting, count, mobile filter trigger */}
          <div className="flex justify-between items-center bg-[#F3EFE9] px-4 py-3 rounded-lg border border-[#8D7F73]/15">
            <span className="font-sans text-xs font-bold text-[#2B2D2F]/60 uppercase tracking-wider">
              {filteredProducts.length} peças encontradas
            </span>
            
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-1 text-xs font-bold text-[#2B2D2F] border border-[#8D7F73]/40 px-3 py-1.5 rounded hover:bg-[#FDFBF7] transition-all"
              >
                <SlidersHorizontal size={14} />
                FILTRAR
              </button>

              {/* Sorting */}
              <div className="flex items-center gap-1 text-xs">
                <ArrowUpDown size={12} className="text-[#2B2D2F]/50" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-0 font-bold focus:outline-none focus:ring-0 text-[#2B2D2F]"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile filters drawer */}
          {showMobileFilters && (
            <div className="lg:hidden bg-fiosa-linho border border-fiosa-marrom/20 p-6 rounded-xl space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b border-fiosa-marrom/20 pb-2">
                <h3 className="font-serif text-sm font-bold text-fiosa-grafite">Painel de Filtros</h3>
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] font-sans font-bold text-fiosa-terracota"
                >
                  LIMPAR
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Busca..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/20 rounded font-sans text-xs text-fiosa-grafite"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/20 rounded font-sans text-xs text-fiosa-grafite"
                >
                  <option value="ALL">Categoria: Todas</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedArtisan}
                  onChange={(e) => setSelectedArtisan(e.target.value)}
                  className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/20 rounded font-sans text-xs text-fiosa-grafite"
                >
                  <option value="ALL">Artesão: Todos</option>
                  {artisans.map((a) => (
                    <option key={a.id} value={a.slug}>
                      {a.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedTechnique}
                  onChange={(e) => setSelectedTechnique(e.target.value)}
                  className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/20 rounded font-sans text-xs text-fiosa-grafite"
                >
                  <option value="ALL">Técnica: Todas</option>
                  {techniques.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="text-fiosa-terracota animate-spin" size={36} />
            </div>
          ) : (
            <>
              {/* Product Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((produto) => {
                    const fotosArray = JSON.parse(produto.fotos || '[]');
                    const mainFoto = fotosArray[0] || 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80';
                    return (
                      <div
                        key={produto.id}
                        className="group flex flex-col h-full bg-fiosa-cru rounded-xl overflow-hidden border border-fiosa-marrom/10 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                          <Image
                            src={mainFoto}
                            alt={produto.nome}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-fiosa-cru/90 backdrop-blur-sm px-2.5 py-1 rounded text-[9px] font-sans font-bold text-fiosa-oliva border border-fiosa-marrom/20">
                            {produto.categoria.nome}
                          </div>
                          {produto.disponibilidade !== 'DISPONIVEL' && (
                            <div className="absolute bottom-3 right-3 bg-fiosa-terracota/95 text-white px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider">
                              {produto.disponibilidade.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow space-y-2">
                          <div>
                            <h3 className="font-serif text-base text-fiosa-grafite font-bold line-clamp-1 group-hover:text-fiosa-terracota transition-colors">
                              {produto.nome}
                            </h3>
                            <p className="text-[11px] text-fiosa-grafite/60 font-sans mt-0.5">
                              Por{' '}
                              <Link
                                href={`/artesao/${produto.artesao.slug}`}
                                className="underline hover:text-fiosa-terracota"
                              >
                                {produto.artesao.nome}
                              </Link>
                            </p>
                          </div>
                          {produto.descricao && (
                            <p className="font-sans text-[11px] text-fiosa-grafite/70 line-clamp-1 leading-relaxed">
                              {produto.descricao}
                            </p>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-fiosa-marrom/10 mt-auto">
                            {produto.artesao.mostrarPreco && produto.preco ? (
                              <span className="font-sans text-sm font-extrabold text-fiosa-terracota">
                                R$ {produto.preco.toFixed(2).replace('.', ',')}
                              </span>
                            ) : (
                              <span className="font-sans text-[11px] text-fiosa-grafite/50 font-semibold italic">
                                Sob consulta
                              </span>
                            )}
                            <Link
                              href={`/produto/${produto.slug}`}
                              className="bg-fiosa-grafite hover:bg-fiosa-terracota text-white px-3.5 py-2 rounded text-[10px] font-sans font-bold tracking-wider transition-colors uppercase"
                            >
                              Ver Detalhes
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-fiosa-linho text-center p-16 rounded-xl border border-fiosa-marrom/10">
                  <p className="font-serif text-lg text-fiosa-grafite">Nenhum produto encontrado</p>
                  <p className="font-sans text-xs text-fiosa-grafite/60 mt-1">
                    Tente ajustar seus termos de busca ou mudar os filtros da barra lateral.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
