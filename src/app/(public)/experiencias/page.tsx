import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Clock, Landmark, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';

export const revalidate = 0; // Disable cache for dynamic edits

export const metadata: Metadata = {
  title: 'Experiências e Turismo Cultural em Resende Costa | FIOSA',
  description: 'Vivencie a tradição têxtil de Resende Costa de perto. Faça oficinas de tear, tingimento natural com artesãos e explore a cultura mineira.',
};

export default async function ExperienciasPage() {
  const experiences = await prisma.experiencia.findMany({
    where: { status: 'ATIVO' },
    orderBy: { createdAt: 'desc' },
  });
  const config = await getConfig();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-fiosa-oliva uppercase bg-fiosa-oliva/10 px-3 py-1 rounded-full">
          Vivências Locais
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-fiosa-grafite">
          {config.experienciasIntroTitulo}
        </h1>
        <p className="font-sans text-sm text-fiosa-grafite/70 leading-relaxed">
          {config.experienciasIntroTexto}
        </p>
      </div>

      {/* Grid of Experiences */}
      {experiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp) => {
            const cleanPhone = exp.contato ? exp.contato.replace(/\D/g, '') : '';
            const whatsAppPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
            const whatsAppMessage = encodeURIComponent(
              `Olá! Gostaria de obter mais informações e agendar a experiência: ${exp.titulo} em Resende Costa.`
            );
            const bookingUrl = exp.linkExterno || `https://wa.me/${whatsAppPhone}?text=${whatsAppMessage}`;

            return (
              <div
                key={exp.id}
                className="bg-fiosa-cru border border-fiosa-marrom/20 rounded-xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <div className="relative h-60 w-full bg-slate-100">
                  <Image
                    src={exp.imagem || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80'}
                    alt={exp.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <h2 className="font-serif text-xl font-bold text-fiosa-grafite leading-snug">
                    {exp.titulo}
                  </h2>
                  <p className="font-sans text-xs text-fiosa-grafite/70 leading-relaxed flex-grow">
                    {exp.descricao}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-fiosa-marrom/15 text-xs text-fiosa-grafite/60">
                    <div className="flex items-center gap-2">
                      <Compass size={14} className="text-fiosa-oliva shrink-0" />
                      <span>{exp.localizacao}</span>
                    </div>
                    {exp.duracao && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-fiosa-terracota shrink-0" />
                        <span>Duração: <strong className="text-fiosa-grafite">{exp.duracao}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Landmark size={14} className="text-fiosa-oliva shrink-0" />
                      {exp.preco ? (
                        <span>
                          Valor: <strong className="text-fiosa-terracota">R$ {exp.preco.toFixed(2).replace('.', ',')}</strong>
                        </span>
                      ) : (
                        <span>Valor: <strong className="text-fiosa-grafite/50 font-medium italic">Sob consulta / Gratuito</strong></span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={bookingUrl}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-fiosa-oliva hover:bg-fiosa-terracota text-white py-3 rounded font-sans font-bold text-[10px] tracking-wider uppercase transition-colors shadow-sm"
                  >
                    <MessageSquare size={14} />
                    Reservar Experiência
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-fiosa-linho text-center p-16 rounded-xl border border-fiosa-marrom/10 max-w-3xl mx-auto">
          <p className="font-serif text-lg text-fiosa-grafite">Novas vivências em preparação</p>
          <p className="font-sans text-xs text-fiosa-grafite/60 mt-1">
            Estamos estruturando novas oficinas e roteiros de tear para você aproveitar em sua próxima viagem.
          </p>
        </div>
      )}
    </div>
  );
}
