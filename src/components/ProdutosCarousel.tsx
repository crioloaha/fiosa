'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  nome: string;
  slug: string;
  preco: number | null;
  fotos: string; // JSON array
  categoria: {
    nome: string;
  };
  artesao: {
    nome: string;
    mostrarPreco: boolean;
  };
}

interface ProdutosCarouselProps {
  produtos: Product[];
}

export default function ProdutosCarousel({ produtos }: { produtos: any[] }) {
  const [shuffled, setShuffled] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Shuffle products list on page load
  useEffect(() => {
    if (produtos.length === 0) return;
    const arr = [...produtos];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
  }, [produtos]);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [shuffled]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    const firstCard = el.firstElementChild as HTMLElement;
    const step = firstCard ? firstCard.clientWidth + 32 : 320; // card width + gap (gap-8 is 32px)

    el.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth',
    });
  };

  if (shuffled.length === 0) {
    return (
      <div className="flex gap-8 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shrink-0 w-72 h-[420px] bg-fiosa-linho animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-fiosa-cru border border-fiosa-marrom/20 hover:bg-fiosa-oliva hover:text-white text-fiosa-grafite p-3 rounded-full shadow-md hover:shadow-lg transition-all"
          aria-label="Produtos anteriores"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-fiosa-cru border border-fiosa-marrom/20 hover:bg-fiosa-oliva hover:text-white text-fiosa-grafite p-3 rounded-full shadow-md hover:shadow-lg transition-all"
          aria-label="Próximos produtos"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Horizontal scroll container */}
      <div
        ref={containerRef}
        className="flex gap-8 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shuffled.map((produto) => {
          const fotosArray = JSON.parse(produto.fotos || '[]');
          const mainFoto = fotosArray[0] || 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80';

          return (
            <div
              key={produto.id}
              className="snap-start shrink-0 w-72 group/item flex flex-col h-full bg-fiosa-cru rounded-xl overflow-hidden border border-fiosa-marrom/10 shadow-sm"
            >
              <div className="relative h-72 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={mainFoto}
                  alt={produto.nome}
                  fill
                  sizes="288px"
                  className="object-cover group-hover/item:scale-105 transition-transform duration-500"
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

      {/* Subtle fade hint on right edge */}
      {showRightArrow && (
        <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[#FDFBF7] to-transparent opacity-60" />
      )}
    </div>
  );
}
