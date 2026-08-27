import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { ArrowRight, MapPin, Sparkles, Compass, ShieldCheck } from 'lucide-react';

export const revalidate = 0; // Disable caching for dynamic visual analytics increments

export default async function HomePage() {
  const config = await getConfig();

  // Fetch all active artisans ordered by views
  const artesaos = await prisma.artesao.findMany({
    where: { perfilAtivo: true },
    orderBy: { visualizacoesPerfil: 'desc' },
  });

  // Fetch featured products (top 4 by views)
  const produtos = await prisma.produto.findMany({
    where: {
      status: 'PUBLICADO',
      artesao: { perfilAtivo: true },
    },
    take: 4,
    include: {
      artesao: true,
      categoria: true,
    },
    orderBy: { visualizacoes: 'desc' },
  });

  // Fetch experiences
  const experiencias = await prisma.experiencia.findMany({
    where: { status: 'ATIVO' },
    take: 3,
  });

  return (
    <div className="space-y-24 pb-20">
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
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {artesaos.map((artesao) => (
                <div
                  key={artesao.id}
                  className="snap-start shrink-0 w-72 bg-fiosa-cru rounded-xl overflow-hidden border border-fiosa-marrom/10 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative h-56 w-full bg-slate-100">
                    <Image
                      src={artesao.foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'}
                      alt={artesao.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow space-y-3">
                    <div>
                      <h3 className="font-serif text-lg text-fiosa-grafite font-bold">{artesao.nome}</h3>
                      {artesao.marca && (
                        <p className="font-sans text-xs tracking-widest text-fiosa-marrom uppercase font-bold">
                          {artesao.marca}
                        </p>
                      )}
                    </div>
                    <p className="font-sans text-xs text-fiosa-grafite/70 line-clamp-3 leading-relaxed flex-grow">
                      {artesao.bio}
                    </p>
                    <div className="flex items-center text-xs text-fiosa-grafite/50 gap-1 font-semibold">
                      <MapPin size={14} className="text-fiosa-terracota" />
                      {artesao.cidade}
                    </div>
                    <Link
                      href={`/artesao/${artesao.slug}`}
                      className="block text-center border border-fiosa-terracota text-fiosa-terracota hover:bg-fiosa-terracota hover:text-white py-2.5 rounded font-sans font-bold text-[11px] tracking-wider transition-all"
                    >
                      CONHEÇA O ARTESÃO
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {/* Fade hint on right edge */}
            <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-tecelagem to-transparent" />
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {produtos.map((produto) => {
            const fotosArray = JSON.parse(produto.fotos || '[]');
            const mainFoto = fotosArray[0] || 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80';
            return (
              <div
                key={produto.id}
                className="group flex flex-col h-full bg-fiosa-cru rounded-xl overflow-hidden border border-fiosa-marrom/10 shadow-sm"
              >
                <div className="relative h-72 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={mainFoto}
                    alt={produto.nome}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-fiosa-cru/90 backdrop-blur-sm px-3 py-1 rounded text-[10px] font-sans font-bold text-fiosa-oliva border border-fiosa-marrom/20">
                    {produto.categoria.nome}
                  </div>
                </div>
                {/* Visual Loom Fringe Detail */}
                <div className="franja-horizontal" />
                <div className="p-5 flex flex-col flex-grow space-y-3">
                  <div>
                    <h3 className="font-serif text-base text-fiosa-grafite font-bold line-clamp-1">
                      {produto.nome}
                    </h3>
                    <p className="text-[11px] text-fiosa-grafite/60 font-sans">
                      Por <strong>{produto.artesao.nome}</strong>
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-auto border-t border-fiosa-marrom/10">
                    {produto.artesao.mostrarPreco && produto.preco ? (
                      <span className="font-sans text-sm font-extrabold text-fiosa-terracota">
                        R$ {produto.preco.toFixed(2).replace('.', ',')}
                      </span>
                    ) : (
                      <span className="font-sans text-xs text-fiosa-grafite/50 font-semibold italic">
                        Sob consulta
                      </span>
                    )}
                    <Link
                      href={`/produto/${produto.slug}`}
                      className="bg-fiosa-grafite hover:bg-fiosa-terracota text-white px-3 py-2 rounded text-[10px] font-sans font-bold tracking-wider transition-colors uppercase"
                    >
                      Ver produto
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
              Resende Costa, a Capital Mineira do Tear
            </h2>
            <p className="font-sans text-sm text-fiosa-grafite/80 leading-relaxed">
              Localizada no Campo das Vertentes, vizinha de São João del-Rei e Tiradentes, Resende Costa respira artesanato. A cidade é famosa por suas fachadas repletas de colchas, caminhos de mesa e tapetes coloridos, uma tradição que atravessa gerações e remonta ao século XVIII.
            </p>
            <p className="font-sans text-sm text-fiosa-grafite/80 leading-relaxed">
              Caminhar pelas lojas de Resende Costa and ouvir o som ritmado dos teares tradicionais funcionando é uma imersão na cultura viva de Minas Gerais.
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
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
              alt="Montanhas e paisagens de Minas Gerais"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 7. CTA Final */}
      <section className="bg-fiosa-grafite text-center py-20 px-4 space-y-6">
        <h2 className="font-serif text-3xl md:text-5xl text-fiosa-cru">
          Venha conhecer os fios que conectam Resende Costa.
        </h2>
        <p className="max-w-lg mx-auto font-sans text-xs text-fiosa-linho/60 leading-relaxed">
          Nossos artesãos e ateliês estão de portas abertas para apresentar suas tramas, cores e vivências únicas.
        </p>
        <div className="pt-4">
          <Link
            href="/visite-resende-costa"
            className="bg-fiosa-terracota text-white hover:bg-fiosa-terracota/90 px-8 py-4 rounded font-sans font-bold text-xs tracking-wider transition-all duration-300 uppercase shadow-md inline-block"
          >
            PLANEJE SUA VISITA
          </Link>
        </div>
      </section>
    </div>
  );
}
