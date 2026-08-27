import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { ArrowRight, MapPin, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import ArtesaosCarousel from '@/components/ArtesaosCarousel';
import ProdutosCarousel from '@/components/ProdutosCarousel';

export const revalidate = 0; // Disable caching for dynamic visual analytics increments

export default async function HomePage() {
  const config = await getConfig();

  // Fetch all active artisans
  const artesaos = await prisma.artesao.findMany({
    where: { perfilAtivo: true },
  });

  // Fetch featured products (all active products ordered by views)
  const allProducts = await prisma.produto.findMany({
    where: {
      status: 'PUBLICADO',
      artesao: { perfilAtivo: true },
    },
    include: {
      artesao: true,
      categoria: true,
    },
    orderBy: { visualizacoes: 'desc' },
  });

  // Filter to keep at most 1 product per artisan (their most viewed one)
  const seenArtisans = new Set<string>();
  const produtos: any[] = [];
  for (const p of allProducts) {
    if (!seenArtisans.has(p.artesaoId)) {
      seenArtisans.add(p.artesaoId);
      produtos.push(p);
    }
  }

  // Fetch experiences
  const experiencias = await prisma.experiencia.findMany({
    where: { status: 'ATIVO' },
    take: 3,
  });

  return (
    <div className="space-y-24 pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://fiosa.com.br/#organization',
                'name': config.logoTexto,
                'url': 'https://fiosa.com.br',
                'logo': config.logoImagem || 'https://fiosa.com.br/favicon.ico',
                'description': config.rodapeDescricao,
                'address': {
                  '@type': 'PostalAddress',
                  'streetAddress': 'Rua São Sebastião, 100 - Centro',
                  'addressLocality': 'Resende Costa',
                  'addressRegion': 'MG',
                  'postalCode': '36340-000',
                  'addressCountry': 'BR'
                },
                'contactPoint': {
                  '@type': 'ContactPoint',
                  'telephone': config.contatoTelefone || '(32) 3354-1111',
                  'contactType': 'customer service',
                  'availableLanguage': 'Portuguese'
                }
              },
              {
                '@type': 'WebSite',
                '@id': 'https://fiosa.com.br/#website',
                'url': 'https://fiosa.com.br',
                'name': config.logoTexto,
                'description': config.rodapeDescricao,
                'publisher': {
                  '@id': 'https://fiosa.com.br/#organization'
                }
              }
            ]
          })
        }}
      />

      {/* 1. Hero Principal */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-fiosa-grafite">
        {/* Background Image with Tint */}
        <div className="absolute inset-0 z-0">
          <Image
            src={config.heroImagem}
            alt="Tear manual de Resende Costa"
            fill
            className="object-cover opacity-35 object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-fiosa-grafite via-fiosa-grafite/70 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <span className="text-[11px] tracking-[0.3em] font-sans font-bold text-fiosa-cru uppercase bg-fiosa-terracota px-3 py-1 rounded-full">
            {config.heroTag}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-fiosa-cru leading-tight tracking-wider whitespace-pre-line">
            {config.heroTitulo}
          </h1>
          <p className="max-w-2xl mx-auto font-serif text-lg md:text-xl text-fiosa-linho/95 font-light leading-relaxed">
            {config.heroSubtitulo}
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/artesaos"
              className="w-full sm:w-auto bg-fiosa-terracota text-fiosa-cru hover:bg-fiosa-terracota/90 px-8 py-4 rounded font-sans font-bold text-xs tracking-wider transition-all duration-300 shadow-md uppercase"
            >
              Conheça os Artesãos
            </Link>
            <Link
              href="/produtos"
              className="w-full sm:w-auto border border-fiosa-linho text-fiosa-cru hover:bg-fiosa-linho hover:text-fiosa-grafite px-8 py-4 rounded font-sans font-bold text-xs tracking-wider transition-all duration-300 uppercase"
            >
              Explore os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* 2. A FIOSA */}
      <section id="a-fiosa" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] border-2 border-fiosa-marrom/20 p-4 rounded-xl">
            <Image
              src={config.fiosaImagem}
              alt="Produção têxtil FIOSA"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="space-y-6">
            <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-fiosa-terracota uppercase">
              {config.fiosaTag}
            </span>
            <h2 className="font-serif text-4xl text-fiosa-grafite leading-tight">
              {config.fiosaTitulo}
            </h2>
            <p className="font-sans text-sm text-fiosa-grafite/80 leading-relaxed whitespace-pre-line">
              {config.fiosaTexto1}
            </p>
            <p className="font-sans text-sm text-fiosa-grafite/80 leading-relaxed whitespace-pre-line">
              {config.fiosaTexto2}
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex gap-3">
                <Sparkles className="text-fiosa-terracota shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-sm font-semibold text-fiosa-grafite">Design Autoral</h4>
                  <p className="text-xs text-fiosa-grafite/60">Peças sofisticadas e únicas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="text-fiosa-oliva shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-sm font-semibold text-fiosa-grafite">100% Justo</h4>
                  <p className="text-xs text-fiosa-grafite/60">Retorno financeiro direto ao artesão.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Nossos Artesãos */}
      <section className="bg-tecelagem py-20 border-y border-fiosa-marrom/20 relative">
        <div className="absolute top-0 inset-x-0 franja-horizontal" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-4">
            <div>
              <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-fiosa-terracota uppercase">
                Mãos que tecem
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-fiosa-grafite mt-1">
                Nossos Artesãos
              </h2>
            </div>
            <Link
              href="/artesaos"
              className="group inline-flex items-center gap-2 font-sans text-xs tracking-wider font-bold text-fiosa-terracota hover:underline"
            >
              VER TODOS OS ARTESÃOS
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Horizontal scroll carousel */}
          <ArtesaosCarousel artesaos={artesaos} />
        </div>
        <div className="absolute bottom-0 inset-x-0 franja-horizontal" />
      </section>


      {/* 4. Produtos em Destaque */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-4">
          <div>
            <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-fiosa-oliva uppercase">
              Curadoria de peças
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-fiosa-grafite mt-1">
              Produtos em Destaque
            </h2>
          </div>
          <Link
            href="/produtos"
            className="group inline-flex items-center gap-2 font-sans text-xs tracking-wider font-bold text-fiosa-oliva hover:underline"
          >
            VER TODOS OS PRODUTOS
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal scroll carousel of featured products */}
        <ProdutosCarousel produtos={produtos} />
      </section>

      {/* 5. Experiências */}
      <section className="bg-fiosa-oliva py-20 text-fiosa-cru relative">
        {/* Top/Bottom Terracota Loom Fringes */}
        <div className="absolute top-0 inset-x-0 franja-terracota" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-fiosa-linho uppercase bg-fiosa-terracota/80 px-3 py-1 rounded-full">
              Turismo de Experiência
            </span>
            <h2 className="font-serif text-3xl md:text-4xl">
              Vivencie o Artesanato de Perto
            </h2>
            <p className="font-sans text-sm text-fiosa-linho/80 leading-relaxed">
              Resende Costa não é apenas sobre o produto final. É sobre ver as mãos criando, ouvir a lançadeira deslizando no tear e aprender saberes seculares. Escolha uma vivência!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {experiencias.map((exp) => (
              <div
                key={exp.id}
                className="bg-fiosa-cru text-fiosa-grafite rounded-xl overflow-hidden shadow-sm flex flex-col h-full border border-fiosa-marrom/20"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={exp.imagem || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80'}
                    alt={exp.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <h3 className="font-serif text-lg font-bold text-fiosa-grafite line-clamp-2 leading-snug">
                    {exp.titulo}
                  </h3>
                  <p className="font-sans text-xs text-fiosa-grafite/70 line-clamp-3 leading-relaxed flex-grow">
                    {exp.descricao}
                  </p>
                  <div className="space-y-2 pt-3 border-t border-fiosa-marrom/10 text-xs text-fiosa-grafite/60">
                    <div className="flex items-center gap-2">
                      <Compass size={14} className="text-fiosa-oliva" />
                      <span>{exp.localizacao}</span>
                    </div>
                    {exp.duracao && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fiosa-oliva">Duração:</span>
                        <span>{exp.duracao}</span>
                      </div>
                    )}
                    {exp.preco ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fiosa-terracota">Valor:</span>
                        <span className="font-bold text-fiosa-terracota">
                          R$ {exp.preco.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fiosa-grafite/50">Valor:</span>
                        <span className="italic text-fiosa-grafite/50">Gratuito / Consulta</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/experiencias"
                    className="block text-center bg-fiosa-oliva text-white hover:bg-fiosa-terracota py-3 rounded font-sans font-bold text-[10px] tracking-wider transition-colors uppercase"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 franja-terracota" />
      </section>

      {/* 6. Visite Resende Costa */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-fiosa-linho rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-8 md:p-16 space-y-6">
            <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-fiosa-terracota uppercase">
              Turismo Cultural
            </span>
            <h2 className="font-serif text-4xl text-fiosa-grafite leading-tight">
              {config.sobreResendeCostaTitulo}
            </h2>
            <p className="font-sans text-sm text-fiosa-grafite/80 leading-relaxed">
              {config.sobreResendeCostaTexto1}
            </p>
            <p className="font-sans text-sm text-fiosa-grafite/80 leading-relaxed">
              {config.sobreResendeCostaTexto2}
            </p>
            <Link
              href="/visite-resende-costa"
              className="inline-flex items-center gap-2 bg-fiosa-terracota text-fiosa-cru hover:bg-fiosa-terracota/90 px-6 py-3 rounded font-sans font-bold text-xs tracking-wider transition-all duration-300 shadow-sm uppercase"
            >
              Planeje sua visita
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="relative h-[450px] w-full bg-slate-200">
            <Image
              src={config.sobreResendeCostaImagem}
              alt="Sobre Resende Costa"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 7. CTA Final com Moldura e Franjas */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="relative bg-fiosa-grafite border-4 border-double border-fiosa-terracota rounded-2xl p-12 md:p-16 text-center space-y-6 overflow-hidden">
          {/* Top/Bottom Fringe Detail */}
          <div className="absolute top-0 inset-x-0 franja-terracota opacity-80" />
          
          <h2 className="font-serif text-3xl md:text-5xl text-fiosa-cru pt-4">
            {config.ctaTitulo}
          </h2>
          <p className="max-w-2xl mx-auto font-sans text-sm text-fiosa-linho/80 leading-relaxed">
            {config.ctaSubtitulo}
          </p>
          <div className="pt-4 pb-4">
            <Link
              href="/visite-resende-costa"
              className="bg-fiosa-terracota text-white hover:bg-fiosa-terracota/90 px-8 py-4 rounded font-sans font-bold text-xs tracking-wider transition-all duration-300 uppercase shadow-md inline-block"
            >
              PLANEJE SUA VISITA
            </Link>
          </div>
          
          <div className="absolute bottom-0 inset-x-0 franja-terracota opacity-80" />
        </div>
      </section>
    </div>
  );
}
