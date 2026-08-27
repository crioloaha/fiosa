import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageSquare, Phone, MapPin, Instagram, Globe, Facebook, Video } from 'lucide-react';
import AnalyticsTracker from '@/components/AnalyticsTracker';

import type { Metadata } from 'next';

export const revalidate = 0; // Disable cache to read updated data

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artesao = await prisma.artesao.findUnique({
    where: { slug },
  });

  if (!artesao || !artesao.perfilAtivo) {
    return { title: 'Artesão Não Encontrado | FIOSA' };
  }

  const title = `${artesao.nome} — Artesanato em Tear Manual | FIOSA`;
  const description = `Conheça ${artesao.nome}, artesã(o) de Resende Costa, e seus trabalhos produzidos artesanalmente em tear manual. ${artesao.bio || ''}`;
  const mainFoto = artesao.foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop';

  return {
    title,
    description,
    keywords: [
      artesao.nome.toLowerCase(),
      artesao.marca?.toLowerCase() || '',
      `tecelagem ${artesao.nome.toLowerCase()}`,
      `tear ${artesao.nome.toLowerCase()}`,
      'tear manual Resende Costa',
      'artesao de Resende Costa',
      'artesanato de Resende Costa',
      'artesanato mineiro'
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      images: [{ url: mainFoto }],
    },
  };
}

export default async function ArtesaoProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch artisan with their public products
  const artesao = await prisma.artesao.findUnique({
    where: { slug },
    include: {
      produtos: {
        where: { status: 'PUBLICADO' },
        include: { categoria: true },
      },
    },
  });

  if (!artesao || !artesao.perfilAtivo) {
    notFound();
  }

  // Group products by category
  const productsByCategory: { [key: string]: typeof artesao.produtos } = {};
  artesao.produtos.forEach((product) => {
    const catName = product.categoria.nome;
    if (!productsByCategory[catName]) {
      productsByCategory[catName] = [];
    }
    productsByCategory[catName].push(product);
  });

  // Pre-formatted message for WhatsApp
  const cleanPhone = artesao.whatsapp ? artesao.whatsapp.replace(/\D/g, '') : '';
  // Ensure it has Brazil country code if not present (assuming local numbers might miss 55)
  const whatsAppPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
  const whatsAppMessage = encodeURIComponent(
    `Olá, ${artesao.nome}! Vi seu perfil no catálogo colaborativo da FIOSA e gostaria de conhecer mais sobre suas peças.`
  );
  const whatsAppUrl = `https://wa.me/${whatsAppPhone}?text=${whatsAppMessage}`;

  return (
    <div className="pb-24">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Person',
                '@id': `https://fiosa.com.br/artesao/${artesao.slug}#artesao`,
                'name': artesao.nome,
                'description': artesao.bio || '',
                'image': artesao.foto || '',
                'jobTitle': 'Artesão',
                'address': {
                  '@type': 'PostalAddress',
                  'addressLocality': 'Resende Costa',
                  'addressRegion': 'MG',
                  'addressCountry': 'BR'
                },
                'brand': {
                  '@type': 'Brand',
                  'name': artesao.marca || artesao.nome
                }
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `https://fiosa.com.br/artesao/${artesao.slug}#breadcrumb`,
                'itemListElement': [
                  {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Início',
                    'item': 'https://fiosa.com.br'
                  },
                  {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': 'Artesãos',
                    'item': 'https://fiosa.com.br/artesaos'
                  },
                  {
                    '@type': 'ListItem',
                    'position': 3,
                    'name': artesao.nome,
                    'item': `https://fiosa.com.br/artesao/${artesao.slug}`
                  }
                ]
              }
            ]
          })
        }}
      />

      {/* Client-side analytics tracker */}
      <AnalyticsTracker slug={slug} type="profile" />

      {/* Capa / Banner */}
      <div className="relative h-64 md:h-96 w-full bg-[#8D7F73]/20">
        <Image
          src={artesao.capa || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80'}
          alt={`Capa de ${artesao.nome}`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile info container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Sidebar: Profile card */}
          <div className="lg:col-span-1 bg-[#FDFBF7] border border-[#8D7F73]/25 p-8 rounded-xl shadow-sm space-y-6">
            {/* Avatar image */}
            <div className="flex justify-center">
              <div className="relative h-40 w-40 rounded-full border-4 border-[#FDFBF7] shadow-md overflow-hidden bg-slate-100">
                <Image
                  src={artesao.foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'}
                  alt={artesao.nome}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name & Brand */}
            <div className="text-center space-y-1">
              <h1 className="font-serif text-2xl font-bold text-[#2B2D2F]">{artesao.nome}</h1>
              {artesao.marca && (
                <p className="font-sans text-xs tracking-widest text-[#8D7F73] uppercase font-extrabold">
                  {artesao.marca}
                </p>
              )}
              <p className="font-sans text-[11px] text-[#2B2D2F]/50 flex justify-center items-center gap-1 font-semibold">
                <MapPin size={12} className="text-[#C15C3D]" />
                {artesao.cidade}
              </p>
            </div>

            {/* Quick bio */}
            <p className="font-sans text-xs text-[#2B2D2F]/70 text-center italic leading-relaxed border-t border-b border-[#8D7F73]/10 py-4">
              "{artesao.bio}"
            </p>

            {/* Contact Buttons */}
            <div className="space-y-3">
              {artesao.aceitarWhats && artesao.whatsapp && (
                <Link
                  href={whatsAppUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-[#606C38] text-white hover:bg-[#606C38]/90 py-3 rounded font-sans font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
                >
                  <MessageSquare size={16} />
                  Falar pelo WhatsApp
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-sans font-bold tracking-wider">
                {artesao.instagram && (
                  <Link
                    href={`https://instagram.com/${artesao.instagram.replace('@', '')}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1 border border-[#8D7F73]/30 hover:bg-[#F3EFE9] text-[#2B2D2F] py-2.5 rounded transition-colors"
                  >
                    <Instagram size={14} className="text-[#C15C3D]" />
                    INSTAGRAM
                  </Link>
                )}
                {artesao.website && (
                  <Link
                    href={artesao.website.startsWith('http') ? artesao.website : `https://${artesao.website}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1 border border-[#8D7F73]/30 hover:bg-[#F3EFE9] text-[#2B2D2F] py-2.5 rounded transition-colors"
                  >
                    <Globe size={14} className="text-[#606C38]" />
                    WEBSITE
                  </Link>
                )}
              </div>
            </div>

            {/* Address & details */}
            <div className="space-y-4 pt-4 border-t border-[#8D7F73]/10 text-xs text-[#2B2D2F]/70">
              {artesao.mostrarEndereco && artesao.endereco && (
                <div>
                  <h4 className="font-sans font-bold text-[#2B2D2F] text-[10px] uppercase tracking-wider text-[#8D7F73] mb-1">
                    Ateliê / Endereço
                  </h4>
                  <p className="leading-relaxed">
                    {artesao.endereco}<br />
                    Resende Costa - MG{artesao.cep ? `, CEP ${artesao.cep}` : ''}
                  </p>
                </div>
              )}

              {artesao.mostrarTelefone && artesao.telefone && (
                <div>
                  <h4 className="font-sans font-bold text-[#2B2D2F] text-[10px] uppercase tracking-wider text-[#8D7F73] mb-1">
                    Telefone Fixo
                  </h4>
                  <p className="flex items-center gap-1">
                    <Phone size={12} className="text-[#8D7F73]" />
                    {artesao.telefone}
                  </p>
                </div>
              )}

              {/* Other links */}
              <div className="flex gap-3 pt-2">
                {artesao.facebook && (
                  <Link
                    href={`https://facebook.com/${artesao.facebook}`}
                    target="_blank"
                    className="text-[#2B2D2F]/50 hover:text-[#C15C3D]"
                  >
                    <Facebook size={18} />
                  </Link>
                )}
                {artesao.tiktok && (
                  <Link
                    href={`https://tiktok.com/@${artesao.tiktok}`}
                    target="_blank"
                    className="text-[#2B2D2F]/50 hover:text-[#C15C3D]"
                  >
                    <Video size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Main content: History & Catalog */}
          <div className="lg:col-span-2 space-y-12">
            {/* History section */}
            <div className="bg-[#FDFBF7] border border-[#8D7F73]/15 p-8 md:p-10 rounded-xl shadow-sm space-y-6">
              <h2 className="font-serif text-3xl text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-4">
                História por trás das tramas
              </h2>
              <p className="font-sans text-sm text-[#2B2D2F]/80 leading-relaxed whitespace-pre-line">
                {artesao.historia || 'História em elaboração pelo artesão.'}
              </p>
            </div>

            {/* Embedded Map if configured */}
            {artesao.localizacaoMapa && artesao.mostrarEndereco && (
              <div className="bg-[#FDFBF7] border border-[#8D7F73]/15 p-4 rounded-xl shadow-sm space-y-3">
                <h4 className="font-serif text-sm font-semibold text-[#2B2D2F]">Como Chegar</h4>
                <div className="relative h-60 w-full rounded overflow-hidden">
                  <iframe
                    src={artesao.localizacaoMapa}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Catalog Section */}
        <div className="mt-20 space-y-12">
          <div className="border-b border-[#8D7F73]/20 pb-4">
            <h2 className="font-serif text-3xl text-[#2B2D2F]">
              Vitrine de Produtos
            </h2>
            <p className="font-sans text-xs text-[#2B2D2F]/60 mt-1 uppercase tracking-wider font-semibold">
              Peças criadas e tecidas por {artesao.nome}
            </p>
          </div>

          {Object.keys(productsByCategory).length > 0 ? (
            <div className="space-y-16">
              {Object.entries(productsByCategory).map(([category, products]) => (
                <div key={category} className="space-y-6">
                  <h3 className="font-serif text-xl text-[#606C38] border-l-4 border-[#C15C3D] pl-3 uppercase tracking-wider font-semibold">
                    {category}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((produto) => {
                      const fotosArray = JSON.parse(produto.fotos || '[]');
                      const mainFoto = fotosArray[0] || 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80';
                      return (
                        <div
                          key={produto.id}
                          className="group flex flex-col h-full bg-[#FDFBF7] rounded-xl overflow-hidden border border-[#8D7F73]/10 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                            <Image
                              src={mainFoto}
                              alt={produto.nome}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-[#FDFBF7]/90 backdrop-blur-sm px-2.5 py-1 rounded text-[9px] font-sans font-bold text-[#606C38] border border-[#8D7F73]/20">
                              {produto.disponibilidade.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="p-5 flex flex-col flex-grow space-y-3">
                            <h4 className="font-serif text-base text-[#2B2D2F] font-bold line-clamp-1">
                              {produto.nome}
                            </h4>
                            <p className="font-sans text-xs text-[#2B2D2F]/60 line-clamp-2 leading-relaxed flex-grow">
                              {produto.descricao}
                            </p>
                            <div className="flex justify-between items-center pt-3 border-t border-[#8D7F73]/10 mt-auto">
                              {artesao.mostrarPreco && produto.preco ? (
                                <span className="font-sans text-sm font-extrabold text-[#C15C3D]">
                                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                                </span>
                              ) : (
                                <span className="font-sans text-[11px] text-[#2B2D2F]/50 font-semibold italic">
                                  Sob consulta
                                </span>
                              )}
                              <Link
                                href={`/produto/${produto.slug}`}
                                className="bg-[#2B2D2F] hover:bg-[#C15C3D] text-white px-3 py-2 rounded text-[10px] font-sans font-bold tracking-wider transition-colors uppercase"
                              >
                                Ver Detalhes
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#F3EFE9] text-center p-12 rounded-xl border border-[#8D7F73]/10">
              <p className="font-serif text-lg text-[#2B2D2F]">Catálogo de produtos em atualização</p>
              <p className="font-sans text-xs text-[#2B2D2F]/60 mt-1">Este artesão está preparando suas peças para a vitrine virtual.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
