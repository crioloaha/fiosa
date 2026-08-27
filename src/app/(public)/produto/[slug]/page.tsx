import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageSquare, ArrowLeft, User, Ruler, Tag, Layers, ClipboardCheck, PackageCheck } from 'lucide-react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductDetailsClient from '@/components/ProductDetailsClient';

import type { Metadata } from 'next';

export const revalidate = 0; // Disable cache to read updated views and edits

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const produto = await prisma.produto.findFirst({
    where: { slug },
    include: {
      artesao: true,
      categoria: true,
    },
  });

  if (!produto) {
    return { title: 'Produto Não Encontrado | FIOSA' };
  }

  const title = `${produto.nome} — Resende Costa | FIOSA`;
  const description = `Compre ${produto.nome} no catálogo coletivo da FIOSA. Tecido artesanalmente em tear manual de Resende Costa por ${produto.artesao.nome}. Dimensões: ${produto.dimensoes || 'Sob consulta'}.`;
  
  const fotosArray = JSON.parse(produto.fotos || '[]');
  const mainFoto = fotosArray[0] || 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80';

  return {
    title,
    description,
    keywords: [
      produto.nome.toLowerCase(),
      `tear ${produto.nome.toLowerCase()}`,
      `artesanato ${produto.artesao.nome.toLowerCase()}`,
      'tear manual Resende Costa',
      'artesanato de Resende Costa',
      'artesanato mineiro',
      produto.categoria.nome.toLowerCase(),
      produto.tecnica?.toLowerCase() || 'tear de pedal'
    ],
    openGraph: {
      title,
      description,
      images: [{ url: mainFoto }],
    },
  };
}

export default async function ProdutoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch product with artisan & category details
  const produto = await prisma.produto.findFirst({
    where: { slug },
    include: {
      artesao: true,
      categoria: true,
    },
  });

  if (!produto || produto.status === 'OCULTO') {
    notFound();
  }

  const fotosArray: string[] = JSON.parse(produto.fotos || '[]');
  if (fotosArray.length === 0) {
    fotosArray.push('https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80');
  }

  // Pre-formatted message for WhatsApp contact
  const cleanPhone = produto.artesao.whatsapp ? produto.artesao.whatsapp.replace(/\D/g, '') : '';
  const whatsAppPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
  const whatsAppMessage = encodeURIComponent(
    `Olá! Vi o produto ${produto.nome} no catálogo da FIOSA e gostaria de saber mais informações sobre valores, frete ou sob encomenda.`
  );
  const whatsAppUrl = `https://wa.me/${whatsAppPhone}?text=${whatsAppMessage}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Product',
                '@id': `https://fiosa.com.br/produto/${produto.slug}#produto`,
                'name': produto.nome,
                'image': fotosArray[0],
                'description': produto.descricao || '',
                'offers': produto.preco ? {
                  '@type': 'Offer',
                  'price': produto.preco,
                  'priceCurrency': 'BRL',
                  'availability': produto.disponibilidade === 'DISPONIVEL' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder'
                } : undefined,
                'brand': {
                  '@type': 'Brand',
                  'name': produto.artesao.marca || produto.artesao.nome
                }
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `https://fiosa.com.br/produto/${produto.slug}#breadcrumb`,
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
                    'name': 'Produtos',
                    'item': 'https://fiosa.com.br/produtos'
                  },
                  {
                    '@type': 'ListItem',
                    'position': 3,
                    'name': produto.nome,
                    'item': `https://fiosa.com.br/produto/${produto.slug}`
                  }
                ]
              }
            ]
          })
        }}
      />

      {/* Client-side analytics tracker */}
      <AnalyticsTracker id={produto.id} type="product" />

      {/* Back button */}
      <div>
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-fiosa-grafite/60 hover:text-fiosa-terracota transition-colors"
        >
          <ArrowLeft size={14} />
          VOLTAR PARA O CATÁLOGO
        </Link>
      </div>

      {/* Main product presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Photo gallery */}
        <div className="lg:col-span-7 space-y-4">
          <ProductImageGallery images={fotosArray} productName={produto.nome} />
        </div>

        {/* Right column: Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <span className="inline-block bg-fiosa-oliva/10 px-2.5 py-1 rounded text-[10px] font-sans font-bold text-fiosa-oliva border border-fiosa-marrom/20 uppercase">
              {produto.categoria.nome}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-fiosa-grafite font-bold leading-tight">
              {produto.nome}
            </h1>
            <p className="font-sans text-xs text-fiosa-grafite/50">
              Cód/SKU: <strong className="text-fiosa-grafite/80">{produto.codigo || 'Não informado'}</strong>
            </p>
          </div>

          {/* Client-side product variations & pricing & WhatsApp */}
          <ProductDetailsClient
            produtoNome={produto.nome}
            artesaoNome={produto.artesao.nome}
            artesaoWhatsapp={produto.artesao.whatsapp}
            artesaoAceitarWhats={produto.artesao.aceitarWhats}
            artesaoMostrarPreco={produto.artesao.mostrarPreco}
            basePreco={produto.preco}
            variacoesJson={(produto as any).variacoes || null}
          />

          {/* Short description */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-fiosa-grafite">Descrição</h3>
            <p className="font-sans text-sm text-fiosa-grafite/80 leading-relaxed whitespace-pre-line">
              {produto.descricao || 'Nenhuma descrição fornecida para este produto.'}
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="bg-fiosa-linho border border-fiosa-marrom/20 rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-fiosa-grafite border-b border-fiosa-marrom/20 pb-2">
              Ficha Técnica
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-fiosa-grafite/60">
                <Ruler size={16} className="text-fiosa-terracota" />
                <div>
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-fiosa-marrom">Dimensões</span>
                  <span className="text-fiosa-grafite font-semibold">{produto.dimensoes || 'Não especificada'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-fiosa-grafite/60">
                <Layers size={16} className="text-fiosa-oliva" />
                <div>
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-fiosa-marrom">Materiais</span>
                  <span className="text-fiosa-grafite font-semibold">{produto.materiais || 'Algodão / Fio misto'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-fiosa-grafite/60">
                <Tag size={16} className="text-fiosa-terracota" />
                <div>
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-fiosa-marrom">Técnica Utilizada</span>
                  <span className="text-fiosa-grafite font-semibold">{produto.tecnica || 'Tear manual'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-fiosa-grafite/60">
                <PackageCheck size={16} className="text-fiosa-oliva" />
                <div>
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-fiosa-marrom">Disponibilidade</span>
                  <span className="text-fiosa-grafite font-semibold uppercase">{produto.disponibilidade.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Block: Artisan responsible profile card */}
      <div className="bg-fiosa-cru border border-fiosa-marrom/20 rounded-2xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-12">
        <div className="md:col-span-3 flex justify-center">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-fiosa-marrom/20 shadow-sm bg-slate-100">
            <Image
              src={produto.artesao.foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'}
              alt={produto.artesao.nome}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-6 space-y-3 text-center md:text-left">
          <span className="text-[9px] tracking-[0.2em] font-sans font-bold text-fiosa-marrom uppercase">
            Artesão Responsável
          </span>
          <h2 className="font-serif text-2xl text-fiosa-grafite font-bold">
            {produto.artesao.nome}
          </h2>
          {produto.artesao.marca && (
            <p className="font-sans text-xs tracking-widest text-fiosa-terracota uppercase font-bold -mt-2">
              {produto.artesao.marca}
            </p>
          )}
          <p className="font-sans text-xs text-fiosa-grafite/70 line-clamp-3 leading-relaxed">
            {produto.artesao.bio}
          </p>
        </div>

        <div className="md:col-span-3 flex flex-col gap-3 w-full">
          <Link
            href={`/artesao/${produto.artesao.slug}`}
            className="flex items-center justify-center gap-1.5 w-full bg-fiosa-grafite hover:bg-fiosa-terracota text-white py-3 rounded font-sans font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
          >
            <User size={14} />
            Ver Perfil Completo
          </Link>
        </div>
      </div>
    </div>
  );
}
