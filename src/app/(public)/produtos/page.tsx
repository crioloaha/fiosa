import { Metadata } from 'next';
import ProdutosPageClient from './ProdutosPageClient';

export const metadata: Metadata = {
  title: 'Catálogo de Artesanato em Tear Manual - Resende Costa | FIOSA',
  description: 'Explore o catálogo de artesanato da FIOSA. Encontre mantas, tapetes, bolsas, caminhos de mesa e almofadas feitos à mão por artesãos de Resende Costa.',
};

export default function Page() {
  return <ProdutosPageClient />;
}
