import Link from 'next/link';

export default function Footer({ config }: { config: any }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-fiosa-grafite text-fiosa-linho relative pt-16 pb-8">
      {/* Loom Fringe Detail */}
      <div className="absolute top-0 inset-x-0 franja-horizontal opacity-85" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Concept */}
          <div className="md:col-span-2">
            <Link href="/" className="flex flex-col mb-4">
              <span className="font-serif text-3xl font-bold tracking-widest text-fiosa-cru">
                {config?.logoTexto || 'FIOSA'}
              </span>
              {config?.logoSubtitulo && config.logoSubtitulo.trim() !== '' && (
                <span className="text-[10px] tracking-[0.2em] font-sans text-fiosa-marrom uppercase -mt-1">
                  {config.logoSubtitulo}
                </span>
              )}
            </Link>
            <p className="font-serif text-base text-fiosa-linho/80 italic max-w-sm mb-4">
              "{config?.rodapeSlogan || 'Fios que conectam pessoas, histórias e lugares.'}"
            </p>
            <p className="font-sans text-xs text-fiosa-linho/60 leading-relaxed max-w-md">
              {config?.rodapeDescricao || 'A FIOSA é uma vitrine e espaço colaborativo...'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-fiosa-cru tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2 text-xs font-semibold tracking-wider font-sans">
              <li>
                <Link href="/" className="hover:text-fiosa-terracota transition-colors">FIOSA</Link>
              </li>
              <li>
                <Link href="/artesaos" className="hover:text-fiosa-terracota transition-colors">ARTESÃOS</Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-fiosa-terracota transition-colors">PRODUTOS</Link>
              </li>
              <li>
                <Link href="/experiencias" className="hover:text-fiosa-terracota transition-colors">EXPERIÊNCIAS</Link>
              </li>
              <li>
                <Link href="/visite-resende-costa" className="hover:text-fiosa-terracota transition-colors">VISITE RESENDE COSTA</Link>
              </li>
            </ul>
          </div>

          {/* Contacts & Location */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-fiosa-cru tracking-wider mb-4">Contato</h4>
            <p className="font-sans text-xs text-fiosa-linho/80 leading-relaxed mb-2 whitespace-pre-line">
              <strong>Endereço:</strong><br />
              {config?.contatoEndereco}
            </p>
            <p className="font-sans text-xs text-fiosa-linho/80 leading-relaxed mb-4 whitespace-pre-line">
              <strong>Atendimento físico:</strong><br />
              {config?.contatoAtendimento}
            </p>
            <p className="font-sans text-xs text-fiosa-linho/80 leading-relaxed">
              <strong>WhatsApp:</strong> {config?.contatoWhatsapp}<br />
              <strong>E-mail:</strong> {config?.contatoEmail}
            </p>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-8 border-t border-fiosa-marrom/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[11px] text-fiosa-linho/40">
            &copy; {currentYear} {config?.logoTexto || 'FIOSA'}. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 text-[11px] text-fiosa-linho/40 font-sans font-semibold">
            <Link href="/admin/login" className="hover:text-fiosa-terracota transition-colors">Área do Artesão</Link>
            <span>&bull;</span>
            <span className="text-fiosa-marrom/60">Resende Costa / MG - Capital do Tear</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
