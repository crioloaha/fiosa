import { Metadata } from 'next';
import ArtesaosPageClient from './ArtesaosPageClient';

export const metadata: Metadata = {
  title: 'Artesãos de Resende Costa - Tear Manual e Tradição | FIOSA',
  description: 'Conheça os artesãos da FIOSA em Resende Costa. Descubra a história e o catálogo de tecelões tradicionais que transformam fios em obras de arte.',
};

export default function Page() {
  return <ArtesaosPageClient />;
}
