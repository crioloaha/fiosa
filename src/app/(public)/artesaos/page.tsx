'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface Artesao {
  id: string;
  nome: string;
  marca: string | null;
  slug: string;
  bio: string | null;
  foto: string | null;
  cidade: string;
  perfilAtivo: boolean;
}

export default function ArtesaosPage() {
  const [artesaoList, setArtesaoList] = useState<Artesao[]>([]);
  const [filteredArtesaos, setFilteredArtesaos] = useState<Artesao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  useEffect(() => {
    // Increment view counter if we had statistics, but here we just fetch artisans
    fetch('/api/artesao')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtesaoList(data);
          setFilteredArtesaos(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar artesãos:', err);
        setLoading(false);
      });
  }, []);

  // Handle live search and filter
  useEffect(() => {
    let result = artesaoList;

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(
        (artesao) =>
          artesao.nome.toLowerCase().includes(q) ||
          (artesao.marca && artesao.marca.toLowerCase().includes(q)) ||
          (artesao.bio && artesao.bio.toLowerCase().includes(q))
      );
    }

    if (selectedSpecialty !== 'ALL') {
      const qSpec = selectedSpecialty.toLowerCase();
      result = result.filter(
        (artesao) =>
          artesao.bio?.toLowerCase().includes(qSpec) ||
          artesao.marca?.toLowerCase().includes(qSpec)
      );
    }

    setFilteredArtesaos(result);
  }, [search, selectedSpecialty, artesaoList]);

  // Extract unique specialties from bios/marcas as a heuristic, or provide common options
  const specialties = [
    { label: 'Todas as Especialidades', value: 'ALL' },
    { label: 'Tear Manual / Colchas', value: 'tear' },
    { label: 'Crochê / Fio Náutico', value: 'crochê' },
    { label: 'Linho & Fibras', value: 'linho' },
    { label: 'Almofadas & Enxovais', value: 'almofada' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-[#C15C3D] uppercase bg-[#C15C3D]/10 px-3 py-1 rounded-full">
          Nossas Mãos
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2B2D2F]">
          Conheça os Artesãos
        </h1>
        <p className="font-sans text-sm text-[#2B2D2F]/70 leading-relaxed">
          Descubra as mentes criativas e as mãos habilidosas por trás da tradição do tear em Resende Costa. Cada artesão traz uma assinatura única em suas tramas e fios.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F3EFE9] p-6 rounded-xl border border-[#8D7F73]/20 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-3.5 text-[#2B2D2F]/40" size={18} />
          <input
            type="text"
            placeholder="Buscar artesão por nome, marca ou história..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-sm"
          />
        </div>

        {/* Specialty Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-sm text-[#2B2D2F]"
          >
            {specialties.map((spec) => (
              <option key={spec.value} value={spec.value}>
                {spec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="text-[#C15C3D] animate-spin" size={32} />
        </div>
      ) : (
        <>
          {/* Results Info */}
          <div className="text-xs font-sans text-[#2B2D2F]/50 font-bold uppercase tracking-wider">
            Encontrados {filteredArtesaos.length} artesãos
          </div>

          {/* Grid list */}
          {filteredArtesaos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredArtesaos.map((artesao) => (
                <div
                  key={artesao.id}
                  className="group bg-[#FDFBF7] rounded-xl overflow-hidden border border-[#8D7F73]/15 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="relative h-64 w-full bg-slate-100">
                    <Image
                      src={artesao.foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'}
                      alt={artesao.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div>
                      <h3 className="font-serif text-xl text-[#2B2D2F] font-bold group-hover:text-[#C15C3D] transition-colors">
                        {artesao.nome}
                      </h3>
                      {artesao.marca && (
                        <p className="font-sans text-xs tracking-widest text-[#8D7F73] uppercase font-bold">
                          {artesao.marca}
                        </p>
                      )}
                    </div>
                    <p className="font-sans text-xs text-[#2B2D2F]/70 line-clamp-3 leading-relaxed flex-grow">
                      {artesao.bio}
                    </p>
                    <div className="flex items-center text-xs text-[#2B2D2F]/50 gap-1 font-semibold">
                      <MapPin size={14} className="text-[#C15C3D]" />
                      {artesao.cidade}
                    </div>
                    <Link
                      href={`/artesao/${artesao.slug}`}
                      className="block text-center bg-[#2B2D2F] text-white hover:bg-[#C15C3D] py-3 rounded font-sans font-bold text-[11px] tracking-wider transition-colors uppercase"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#F3EFE9] text-center p-12 rounded-xl border border-[#8D7F73]/10">
              <p className="font-serif text-lg text-[#2B2D2F]">Nenhum artesão encontrado</p>
              <p className="font-sans text-xs text-[#2B2D2F]/60 mt-1">Tente ajustar seus termos de busca ou filtros.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
