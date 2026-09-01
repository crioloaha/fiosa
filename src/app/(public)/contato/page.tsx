import { Mail, Phone, MessageSquare, MapPin, Clock, Instagram } from 'lucide-react';
import { getConfig } from '@/lib/config';
import ContactForm from '@/components/ContactForm';
import type { Metadata } from 'next';

export const revalidate = 0; // Disable caching for dynamic edits

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return {
    title: `Fale Conosco — ${config.logoTexto}`,
    description: `Entre em contato com a equipe da ${config.logoTexto}. Telefone, endereço, horário e atendimento do portal colaborativo.`,
  };
}

export default async function ContatoPage() {
  const config = await getConfig();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-fiosa-terracota uppercase bg-fiosa-terracota/10 px-3 py-1 rounded-full">
          Fale Conosco
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-fiosa-grafite">
          {config.contatoIntroTitulo}
        </h1>
        <p className="font-sans text-sm text-fiosa-grafite/70 leading-relaxed">
          {config.contatoIntroTexto}
        </p>
      </div>

      {/* Main Grid: Form vs Contacts info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Contact Info & Map */}
        <div className="lg:col-span-5 space-y-8 bg-fiosa-linho border border-fiosa-marrom/25 p-8 rounded-xl">
          <h2 className="font-serif text-2xl text-fiosa-grafite font-bold border-b border-fiosa-marrom/20 pb-4">
            Informações
          </h2>

          <div className="space-y-6 font-sans text-xs text-fiosa-grafite/80">
            {/* Address */}
            <div className="flex gap-3">
              <MapPin className="text-fiosa-terracota shrink-0" size={18} />
              <div>
                <strong className="block text-fiosa-grafite text-[10px] uppercase tracking-wider mb-0.5">Endereço Físico</strong>
                <span className="whitespace-pre-line">{config.contatoEndereco}</span>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex gap-3">
              <Clock className="text-fiosa-oliva shrink-0" size={18} />
              <div>
                <strong className="block text-fiosa-grafite text-[10px] uppercase tracking-wider mb-0.5">Horário de Funcionamento</strong>
                <span className="whitespace-pre-line">{config.contatoAtendimento}</span>
              </div>
            </div>

            {/* Phone */}
            {config.contatoTelefone && (
              <div className="flex gap-3">
                <Phone className="text-fiosa-terracota shrink-0" size={18} />
                <div>
                  <strong className="block text-fiosa-grafite text-[10px] uppercase tracking-wider mb-0.5">Telefone Fixo</strong>
                  <span>{config.contatoTelefone}</span>
                </div>
              </div>
            )}

            {/* WhatsApp */}
            {config.contatoWhatsapp && (
              <div className="flex gap-3">
                <MessageSquare className="text-fiosa-oliva shrink-0" size={18} />
                <div>
                  <strong className="block text-fiosa-grafite text-[10px] uppercase tracking-wider mb-0.5">WhatsApp Loja</strong>
                  <span>{config.contatoWhatsapp}</span>
                </div>
              </div>
            )}

            {/* Email */}
            {config.contatoEmail && (
              <div className="flex gap-3">
                <Mail className="text-fiosa-terracota shrink-0" size={18} />
                <div>
                  <strong className="block text-fiosa-grafite text-[10px] uppercase tracking-wider mb-0.5">E-mail Institucional</strong>
                  <span>{config.contatoEmail}</span>
                </div>
              </div>
            )}

            {/* Instagram */}
            {config.contatoInstagram && (
              <div className="flex gap-3">
                <Instagram className="text-fiosa-oliva shrink-0" size={18} />
                <div>
                  <strong className="block text-fiosa-grafite text-[10px] uppercase tracking-wider mb-0.5">Siga no Instagram</strong>
                  <a
                    href={`https://instagram.com/${config.contatoInstagram}`}
                    target="_blank"
                    className="underline hover:text-fiosa-terracota font-bold"
                  >
                    @{config.contatoInstagram}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Embedded Map */}
          {(() => {
            let mapSrc = config.contatoMapaIframe || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14872.238473855011!2d-44.4237194!3d-20.8931135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9f560e206037e9%3A0xc6c4de055f65bc7c!2sResende%20Costa%2C%20MG!5e0!3m2!1spt-BR!2sbr!4v1714850000000";
            if (mapSrc.includes('<iframe')) {
              const match = mapSrc.match(/src="([^"]+)"/);
              if (match) mapSrc = match[1];
            }
            return (
              <div className="relative h-48 w-full rounded overflow-hidden shadow-sm border border-fiosa-marrom/20">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                ></iframe>
              </div>
            );
          })()}
        </div>

        {/* Right: Contact Form */}
        <ContactForm />
      </div>
    </div>
  );
}
