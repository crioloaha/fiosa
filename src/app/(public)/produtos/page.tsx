import { Metadata } from 'next';
import Link from 'next/link';
import { getConfig } from '@/lib/config';
import { ShoppingBag, ArrowRight, User, MessageCircle } from 'lucide-react';
import ProdutosPageClient from './ProdutosPageClient';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Catálogo de Artesanato em Tear Manual - Resende Costa | FIOSA',
  description: 'Explore o catálogo de artesanato da FIOSA. Encontre mantas, tapetes, bolsas, caminhos de mesa e almofadas feitos à mão por artesãos de Resende Costa.',
};

export default async function Page() {
  const config = await getConfig();

  if (config.catalogoAtivo === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-fiosa-cru border border-fiosa-marrom/20 rounded-2xl p-10 md:p-14 shadow-sm space-y-6">
          <div className="w-16 h-16 mx-auto bg-fiosa-terracota/10 text-fiosa-terracota rounded-full flex items-center justify-center">
            <ShoppingBag size={32} />
          </div>
          <span className="text-[11px] tracking-[0.25em] font-sans font-bold text-fiosa-terracota uppercase bg-fiosa-terracota/10 px-3.5 py-1.5 rounded-full inline-block">
            Aviso Temporário
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-fiosa-grafite">
            Catálogo Temporariamente Fora do Ar
          </h1>
          <p className="font-sans text-sm md:text-base text-fiosa-grafite/75 leading-relaxed">
            Nosso catálogo de produtos está temporariamente desativado para atualização de coleções e peças. Em breve teremos novidades tecidas à mão por aqui!
          </p>
          <p className="font-sans text-xs text-fiosa-grafite/60 leading-relaxed">
            Você ainda pode conhecer nossos artesãos, descobrir suas histórias e contatar diretamente seus ateliês para consultar peças sob encomenda ou pronta-entrega.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/artesaos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-fiosa-terracota text-fiosa-cru hover:bg-fiosa-terracota/90 px-6 py-3.5 rounded font-sans font-bold text-xs tracking-wider transition-all uppercase shadow-sm"
            >
              <User size={15} />
              Conhecer Artesãos
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contato"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-fiosa-marrom/30 text-fiosa-grafite hover:bg-fiosa-linho px-6 py-3.5 rounded font-sans font-bold text-xs tracking-wider transition-all uppercase"
            >
              <MessageCircle size={15} />
              Falar com a FIOSA
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProdutosPageClient />;
}
