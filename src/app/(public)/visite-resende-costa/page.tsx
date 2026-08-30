import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Compass, UtensilsCrossed, Hotel, Navigation } from 'lucide-react';
import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';

export const revalidate = 0; // Disable caching for dynamic edits

export const metadata: Metadata = {
  title: 'Guia de Turismo de Resende Costa - Capital do Tear | FIOSA',
  description: 'Descubra a história da tradição secular do tear, saiba onde comprar artesanato direto do produtor, onde comer e se hospedar em Resende Costa, Minas Gerais.',
};

export default async function VisiteResendeCostaPage() {
  const config = await getConfig();

  const sections = [
    {
      title: config.visiteSecao1Titulo,
      image: config.visiteSecao1Imagem,
      description: config.visiteSecao1Texto,
    },
    {
      title: config.visiteSecao2Titulo,
      image: config.visiteSecao2Imagem,
      description: config.visiteSecao2Texto,
    },
  ];

  return (
    <div className="space-y-20 pb-24">
      {/* Hero Banner */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden bg-fiosa-grafite">
        <div className="absolute inset-0 z-0">
          <Image
            src={config.visiteBannerImagem || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80"}
            alt="Resende Costa MG"
            fill
            className="object-cover opacity-40 object-center"
            priority
          />
          <div className="absolute inset-0 bg-fiosa-grafite/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-fiosa-areia uppercase bg-fiosa-terracota px-3 py-1 rounded-full">
            Descubra as Vertentes
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-fiosa-cru tracking-wider leading-tight">
            Visite Resende Costa
          </h1>
          <p className="font-serif text-base text-fiosa-linho/85 italic max-w-xl mx-auto">
            "A capital mineira do tear manual, aconchego nas montanhas e gastronomia típica."
          </p>
        </div>
      </section>

      {/* Intro Description */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-serif text-3xl text-fiosa-grafite">{config.visiteIntroTitulo}</h2>
        <p className="font-sans text-sm text-fiosa-grafite/75 leading-relaxed">
          {config.visiteIntroTexto}
        </p>
      </section>

      {/* Split Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {sections.map((sec, idx) => (
          <div
            key={sec.title}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
              idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div className={`relative h-80 rounded-xl overflow-hidden shadow-sm ${idx % 2 !== 0 ? 'lg:order-last' : ''}`}>
              <Image src={sec.image} alt={sec.title} fill className="object-cover" />
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-fiosa-grafite font-bold">{sec.title}</h3>
              <p className="font-sans text-sm text-fiosa-grafite/70 leading-relaxed">{sec.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Travel Guide: eating, sleeping, doing */}
      <section className="bg-fiosa-linho py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl text-fiosa-grafite">Guia do Viajante</h2>
            <p className="font-sans text-xs text-fiosa-grafite/60">Dicas essenciais para aproveitar o melhor de Resende Costa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* What to do */}
            <div className="bg-fiosa-cru p-8 rounded-xl border border-fiosa-marrom/15 shadow-sm space-y-4">
              <div className="bg-fiosa-oliva/10 h-12 w-12 rounded-full flex items-center justify-center text-fiosa-oliva">
                <Compass size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-fiosa-grafite">O que fazer</h3>
              <ul className="font-sans text-xs text-fiosa-grafite/75 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Explorar a Rua São Sebastião e suas dezenas de lojas coloridas.</li>
                <li>Visitar a Igreja Matriz de Nossa Senhora da Penha, no topo da colina.</li>
                <li>Agendar uma <Link href="/experiencias" className="text-fiosa-terracota hover:underline font-bold">Vivência de Tear</Link> com os artesãos locais.</li>
                <li>Apreciar o Mirante da Laje para fotos incríveis do pôr do sol.</li>
              </ul>
            </div>

            {/* Where to eat */}
            <div className="bg-fiosa-cru p-8 rounded-xl border border-fiosa-marrom/15 shadow-sm space-y-4">
              <div className="bg-fiosa-terracota/10 h-12 w-12 rounded-full flex items-center justify-center text-fiosa-terracota">
                <UtensilsCrossed size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-fiosa-grafite">Onde Comer</h3>
              <ul className="font-sans text-xs text-fiosa-grafite/75 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Restaurantes de fogão a lenha no centro histórico (frango com quiabo, tutu à mineira).</li>
                <li>Cafeterias artesanais com pão de queijo quentinho e broas de milho.</li>
                <li>Visitar queijarias locais nos arredores da cidade.</li>
                <li>Docerias típicas vendendo doce de leite e compotas caseiras.</li>
              </ul>
            </div>

            {/* Where to stay */}
            <div className="bg-fiosa-cru p-8 rounded-xl border border-fiosa-marrom/15 shadow-sm space-y-4">
              <div className="bg-fiosa-oliva/10 h-12 w-12 rounded-full flex items-center justify-center text-fiosa-oliva">
                <Hotel size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-fiosa-grafite">Onde Ficar</h3>
              <ul className="font-sans text-xs text-fiosa-grafite/75 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Pousadas coloniais charmosas localizadas no centro histórico.</li>
                <li>Chácaras de turismo rural nos arredores para maior contato com a natureza.</li>
                <li>Hospedagens acolhedoras integradas a propriedades de artesãos.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Access Maps & Coordinates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-fiosa-terracota">
            <Navigation size={20} />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Como Chegar</span>
          </div>
          <h2 className="font-serif text-3xl text-fiosa-grafite font-bold">Localização Fácil</h2>
          <div className="space-y-4 font-sans text-xs text-fiosa-grafite/80 leading-relaxed">
            <p>
              <strong>De carro:</strong> A partir de Belo Horizonte (aproximadamente 240km), o acesso é feito pela BR-040 sentido Rio de Janeiro, seguindo depois pela BR-383 sentido São João del-Rei.
            </p>
            <p>
              <strong>De ônibus:</strong> Existem linhas regulares de ônibus partindo das rodoviárias de São João del-Rei e Belo Horizonte para Resende Costa.
            </p>
            <p className="border-l-4 border-fiosa-terracota pl-3 italic">
              Dica: Combine sua visita a Resende Costa com passeios pelas vizinhas Tiradentes (45km) e Coronel Xavier Chaves (25km) para um roteiro cultural completo do Campo das Vertentes.
            </p>
          </div>
        </div>

        <div className="relative h-80 rounded-xl overflow-hidden border border-fiosa-marrom/20 shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14949.25603704207!2d-44.2483856!3d-20.9009848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa1b4e2d33458ef%3A0xe54d2417743ea40c!2sResende%20Costa%2C%20MG%2C%2036340-000!5e0!3m2!1spt-BR!2sbr!4v1620000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-5xl mx-auto px-4 bg-fiosa-oliva rounded-2xl text-center py-16 text-fiosa-cru space-y-6">
        <h2 className="font-serif text-2xl md:text-4xl">Quer explorar as peças locais agora mesmo?</h2>
        <p className="max-w-md mx-auto font-sans text-xs text-fiosa-linho/70 leading-relaxed">
          Nossos artesãos estão prontos para receber você em seus ateliês físicos ou virtuais. Conheça as peças no nosso catálogo!
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/produtos"
            className="w-full sm:w-auto bg-fiosa-terracota hover:bg-fiosa-terracota/90 text-white font-sans font-bold text-xs tracking-wider px-8 py-3.5 rounded uppercase transition-colors shadow-sm"
          >
            Explorar Catálogo
          </Link>
          <Link
            href="/artesaos"
            className="w-full sm:w-auto border border-fiosa-cru text-fiosa-cru hover:bg-fiosa-cru hover:text-fiosa-oliva font-sans font-bold text-xs tracking-wider px-8 py-3.5 rounded uppercase transition-all"
          >
            Conhecer Artesãos
          </Link>
        </div>
      </section>
    </div>
  );
}
